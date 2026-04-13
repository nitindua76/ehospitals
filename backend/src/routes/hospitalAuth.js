const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Hospital = require('../models/Hospital');
const { upload } = require('../utils/storage');
const hospitalAuth = require('../middleware/hospitalAuth');
const mongoose = require('mongoose');
const streamifier = require('streamifier');

// POST /api/hospital-auth/login — Hospital logs in with their username + password
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        const hospital = await Hospital.findOne({ username: username.toLowerCase().trim() });
        if (!hospital) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isMatch = await hospital.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { id: hospital._id, username: hospital.username, role: 'hospital' },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.json({ token, hospitalId: hospital._id, username: hospital.username, name: hospital.name, has_submitted: hospital.has_submitted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/hospital-auth/register — Hospital registers credentials (called during first submission)
router.post('/register', async (req, res) => {
    try {
        const { username, password, ...hospitalData } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        // Check username not taken
        const existing = await Hospital.findOne({ username: username.toLowerCase().trim() });
        if (existing) {
            return res.status(409).json({ error: 'Username already taken. Please choose another.' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        const hospital = new Hospital({ username: username.toLowerCase().trim(), password, ...hospitalData });
        await hospital.save();
        res.status(201).json({ success: true, message: 'Hospital registered successfully!', id: hospital._id });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'Username already taken. Please choose another.' });
        }
        res.status(400).json({ error: err.message });
    }
});

router.get('/me', require('../middleware/hospitalAuth'), async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.hospital.id);
        if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
        // Use toJSON() to include virtuals
        const safeData = hospital.toJSON();
        delete safeData.password;
        res.json(safeData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/hospital-auth/me — Hospital updates their own submission (requires hospital token)
router.put('/me', hospitalAuth, async (req, res) => {
    try {
        const existing = await Hospital.findById(req.hospital.id);
        if (!existing) return res.status(404).json({ error: 'Hospital not found' });

        // Allowed to update even if submitted? Actually, let's keep it locked if has_submitted is true
        if (existing.has_submitted) {
            return res.status(409).json({ error: 'You have already submitted your information. Re-submission is not allowed.' });
        }

        const {
            _id, __v, createdAt, updatedAt,
            username, password, status, selected, has_submitted, attachments,
            pan_attached, gst_attached, accreditation_attached, fire_safety_attached,
            bank_ecs_attached, tariff_attached, biomedical_attached, pharmacy_attached,
            msme_attached, it_exemption_attached, panel_organizations_attached,
            patient_feedbacks_attached, schedule_of_charges_attached,
            ...rawUpdateData
        } = req.body;

        console.log(`📝 PUT /me: Received update for hospital ${req.hospital.id}`);

        // --- MAPPING FLAT FRONTEND FIELDS TO NESTED SCHEMA ---
        const updateData = {};
        const toBool = (v) => v === 'Yes' ? true : (v === 'No' ? false : v);

        // Accreditations
        if (rawUpdateData.nabh_accredited !== undefined) updateData['accreditations.nabh'] = toBool(rawUpdateData.nabh_accredited);
        if (rawUpdateData.nabl_accredited !== undefined) updateData['accreditations.nabl'] = toBool(rawUpdateData.nabl_accredited);
        if (rawUpdateData.jci_accredited !== undefined) updateData['accreditations.jci'] = toBool(rawUpdateData.jci_accredited);

        // Statutory
        if (rawUpdateData.fire_safety_clearance !== undefined) updateData['statutory_clearances.fire_safety'] = toBool(rawUpdateData.fire_safety_clearance);
        if (rawUpdateData.biomedical_waste_clearance !== undefined) updateData['statutory_clearances.biomedical_waste'] = toBool(rawUpdateData.biomedical_waste_clearance);
        if (rawUpdateData.aerb_approval !== undefined) updateData['statutory_clearances.aerb_approval'] = toBool(rawUpdateData.aerb_approval);
        if (rawUpdateData.pharmacy_license !== undefined) updateData['statutory_clearances.pharmacy_license'] = toBool(rawUpdateData.pharmacy_license);
        if (rawUpdateData.lift_safety_clearance !== undefined) updateData['statutory_clearances.lift_safety'] = toBool(rawUpdateData.lift_safety_clearance);
        if (rawUpdateData.cea_registration !== undefined) updateData['statutory_clearances.cea_registration'] = toBool(rawUpdateData.cea_registration);
        if (rawUpdateData.pollution_control_certificate !== undefined) updateData['statutory_clearances.pollution_control_certificate'] = toBool(rawUpdateData.pollution_control_certificate);

        // Facilities
        if (rawUpdateData.emergency_department !== undefined) updateData['facilities.emergency'] = toBool(rawUpdateData.emergency_department);
        if (rawUpdateData.blood_bank !== undefined) updateData['facilities.blood_bank'] = toBool(rawUpdateData.blood_bank);
        if (rawUpdateData.cathlab !== undefined) updateData['facilities.cathlab'] = toBool(rawUpdateData.cathlab);
        if (rawUpdateData.organ_transplant !== undefined) updateData['facilities.organ_transplant'] = toBool(rawUpdateData.organ_transplant);
        if (rawUpdateData.dialysis_unit !== undefined) updateData['facilities.dialysis'] = toBool(rawUpdateData.dialysis_unit);
        if (rawUpdateData.opd_services !== undefined) updateData['facilities.opd'] = toBool(rawUpdateData.opd_services);
        if (rawUpdateData.ipd_services !== undefined) updateData['facilities.ipd'] = toBool(rawUpdateData.ipd_services);

        if (rawUpdateData.advanced_trauma_care !== undefined) updateData['facilities.advanced_trauma'] = toBool(rawUpdateData.advanced_trauma_care);
        if (rawUpdateData.burns_unit !== undefined) updateData['facilities.burns_unit'] = toBool(rawUpdateData.burns_unit);
        if (rawUpdateData.ipd_psychiatry !== undefined) updateData['facilities.ipd_psychiatry'] = toBool(rawUpdateData.ipd_psychiatry);
        if (rawUpdateData.ivf_facility !== undefined) updateData['facilities.ivf'] = toBool(rawUpdateData.ivf_facility);
        if (rawUpdateData.ventilator_facility !== undefined) updateData['facilities.ventilator'] = toBool(rawUpdateData.ventilator_facility);
        if (rawUpdateData.nicu_facility !== undefined) updateData['facilities.nicu'] = toBool(rawUpdateData.nicu_facility);
        if (rawUpdateData.picu_facility !== undefined) updateData['facilities.picu'] = toBool(rawUpdateData.picu_facility);
        if (rawUpdateData.central_oxygen_supply !== undefined) updateData['facilities.central_oxygen'] = toBool(rawUpdateData.central_oxygen_supply);
        if (rawUpdateData.icu_facility !== undefined) updateData['facilities.icu'] = toBool(rawUpdateData.icu_facility);
        if (rawUpdateData.trauma_facility !== undefined) updateData['facilities.trauma'] = toBool(rawUpdateData.trauma_facility);
        if (rawUpdateData.interventional_radiology !== undefined) updateData['facilities.interventional_radiology'] = toBool(rawUpdateData.interventional_radiology);
        if (rawUpdateData.nuclear_medicine !== undefined) updateData['facilities.nuclear_medicine'] = toBool(rawUpdateData.nuclear_medicine);
        if (rawUpdateData.physiotherapy !== undefined) updateData['facilities.physiotherapy'] = toBool(rawUpdateData.physiotherapy);
        if (rawUpdateData.pain_management !== undefined) updateData['facilities.pain_management'] = toBool(rawUpdateData.pain_management);
        if (rawUpdateData.palliative_care !== undefined) updateData['facilities.palliative_care'] = toBool(rawUpdateData.palliative_care);
        if (rawUpdateData.air_ambulance_tieup !== undefined) updateData['facilities.air_ambulance'] = toBool(rawUpdateData.air_ambulance_tieup);
        if (rawUpdateData.hearse_van_tieup !== undefined) updateData['facilities.hearse_van'] = toBool(rawUpdateData.hearse_van_tieup);

        // Diagnostics
        if (rawUpdateData.ct_scan !== undefined) updateData['diagnostic_facilities.ct'] = rawUpdateData.ct_scan;
        if (rawUpdateData.mri_scan !== undefined) updateData['diagnostic_facilities.mri'] = rawUpdateData.mri_scan;
        if (rawUpdateData.pet_ct_scan !== undefined) updateData['diagnostic_facilities.pet_ct'] = rawUpdateData.pet_ct_scan;
        if (rawUpdateData.echo_cardiology !== undefined) updateData['diagnostic_facilities.echo_cardiology'] = rawUpdateData.echo_cardiology;
        if (rawUpdateData.digital_xray !== undefined) updateData['diagnostic_facilities.digital_xray'] = toBool(rawUpdateData.digital_xray);
        if (rawUpdateData.ultrasound !== undefined) updateData['diagnostic_facilities.ultrasound'] = toBool(rawUpdateData.ultrasound);

        // Misc
        if (rawUpdateData.tariffs_attached !== undefined) updateData['tariff_attached'] = toBool(rawUpdateData.tariffs_attached);
        if (rawUpdateData.ongc_association_years !== undefined) updateData['ongc_association_years'] = Number(rawUpdateData.ongc_association_years);
        
        if (rawUpdateData.date_of_inception) {
            const inception = new Date(rawUpdateData.date_of_inception);
            updateData['date_of_inception'] = inception;
            // Auto-calculate hospital age
            const age = Math.floor((new Date() - inception) / (1000 * 60 * 60 * 24 * 365.25));
            updateData['hospital_age'] = age > 0 ? age : 0;
        }

        // ONGC
        if (rawUpdateData.ongc_vendor_code !== undefined) updateData['ongc_vendor_code'] = rawUpdateData.ongc_vendor_code;
        if (rawUpdateData.cghs_rates_acceptable !== undefined) updateData['cghs_rates_acceptable'] = rawUpdateData.cghs_rates_acceptable;
        if (rawUpdateData.schedule_of_charges_attached !== undefined) updateData['schedule_of_charges_attached'] = rawUpdateData.schedule_of_charges_attached;
        if (rawUpdateData.ongc_discount_percent !== undefined) updateData['ongc_discount_percent'] = Number(rawUpdateData.ongc_discount_percent) || 0;

        // Bank Details
        if (rawUpdateData.bank_name !== undefined) updateData['bank_details.bank_name'] = rawUpdateData.bank_name;
        if (rawUpdateData.account_no !== undefined) updateData['bank_details.account_no'] = rawUpdateData.account_no;
        if (rawUpdateData.ifsc_code !== undefined) updateData['bank_details.ifsc_code'] = rawUpdateData.ifsc_code;
        if (rawUpdateData.ecs_mandate_attached !== undefined) updateData['bank_details.ecs_mandate_attached'] = toBool(rawUpdateData.ecs_mandate_attached);

        // Signatory
        if (rawUpdateData.signatory_name !== undefined) updateData['authorized_signatory.name'] = rawUpdateData.signatory_name;
        if (rawUpdateData.signatory_designation !== undefined) updateData['authorized_signatory.designation'] = rawUpdateData.signatory_designation;
        if (rawUpdateData.signatory_date !== undefined) updateData['authorized_signatory.date'] = rawUpdateData.signatory_date;

        // IT Exemption
        if (rawUpdateData.it_exemption !== undefined) updateData['it_exemption'] = rawUpdateData.it_exemption;
        if (rawUpdateData.it_exemption_permanent !== undefined) updateData['it_exemption_permanent'] = rawUpdateData.it_exemption_permanent;
        if (rawUpdateData.it_exemption_valid_until !== undefined) {
            updateData['it_exemption_valid_until'] = rawUpdateData.it_exemption_valid_until
                ? new Date(rawUpdateData.it_exemption_valid_until)
                : null;
        }

        // Manpower Mapping
        if (rawUpdateData.clinicians && Array.isArray(rawUpdateData.clinicians)) {
            updateData['consultants'] = rawUpdateData.clinicians.map(c => ({
                name: c.name,
                specialty: c.specialty,
                experience_years: Number(c.experience) || 0,
                type: 'Full time' // Default or infer
            }));
        }

        // Handle nested objects from Step6/Step8 (if they come as objects)
        if (rawUpdateData.capacity) {
            Object.keys(rawUpdateData.capacity).forEach(k => {
                updateData[`capacity.${k}`] = rawUpdateData.capacity[k];
            });
        }
        if (rawUpdateData.ongc_patient_count) {
            Object.keys(rawUpdateData.ongc_patient_count).forEach(k => {
                updateData[`ongc_patient_count.${k}`] = rawUpdateData.ongc_patient_count[k];
            });
        }
        if (rawUpdateData.general_facilities) {
            Object.keys(rawUpdateData.general_facilities).forEach(k => {
                updateData[`general_facilities.${k}`] = rawUpdateData.general_facilities[k];
            });
        }

        // Handle everything else that is top-level and not mapped
        const handledFlat = [
            'nabh_accredited', 'nabl_accredited', 'jci_accredited',
            'fire_safety_clearance', 'biomedical_waste_clearance', 'aerb_approval', 'pharmacy_license', 'lift_safety_clearance', 'cea_registration', 'pollution_control_certificate',
            'emergency_department', 'blood_bank', 'cathlab', 'organ_transplant', 'dialysis_unit', 'opd_services', 'ipd_services',
            'advanced_trauma_care', 'burns_unit', 'ipd_psychiatry', 'ivf_facility', 'ventilator_facility', 'nicu_facility', 'picu_facility',
            'central_oxygen_supply', 'icu_facility', 'trauma_facility', 'interventional_radiology', 'nuclear_medicine', 'physiotherapy',
            'pain_management', 'palliative_care', 'air_ambulance_tieup', 'hearse_van_tieup',
            'ct_scan', 'mri_scan', 'pet_ct_scan', 'echo_cardiology', 'digital_xray', 'ultrasound', 'tariffs_attached', 'capacity', 'ongc_patient_count', 'general_facilities',
            'clinicians', 'bank_name', 'account_no', 'ifsc_code', 'ecs_mandate_attached', 'date_of_inception',
            'signatory_name', 'signatory_designation', 'signatory_date',
            'it_exemption', 'it_exemption_permanent', 'it_exemption_valid_until',
            'ongc_vendor_code', 'cghs_rates_acceptable', 'ongc_discount_percent',
            // Also exclude the structured objects themselves to avoid conflicts
            'accreditations', 'statutory_clearances', 'facilities', 'diagnostic_facilities', 'consultants', 'bank_details', 'authorized_signatory'
        ];

        Object.keys(rawUpdateData).forEach(key => {
            if (!handledFlat.includes(key)) {
                updateData[key] = rawUpdateData[key];
            }
        });

        console.log('📦 updateData keys mapped:', Object.keys(updateData));

        const hospital = await Hospital.findByIdAndUpdate(
            req.hospital.id,
            { $set: updateData },
            { new: true, runValidators: false }
        );

        if (!hospital) {
            return res.status(404).json({ error: 'Hospital not found' });
        }

        const safeData = hospital.toJSON();
        delete safeData.password;
        res.json({ success: true, hospital: safeData });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/hospital-auth/upload — Upload a file (requires hospital token)
router.post('/upload', hospitalAuth, upload.single('file'), async (req, res) => {
    console.log(`🚀 /upload: Received file in memory: ${req.file ? req.file.originalname : 'NONE'}`);

    try {
        const { field } = req.body; // e.g., 'pan', 'gst'
        if (!req.file) {
            console.error(`❌ /upload: No file in req.file!`);
            return res.status(400).json({ error: 'No file uploaded' });
        }
        if (!field) {
            console.error(`❌ /upload: Field name missing in req.body!`);
            return res.status(400).json({ error: 'Field name required' });
        }

        // Initialize GridFS bucket
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads'
        });

        // Create upload stream
        const uploadStream = bucket.openUploadStream(req.file.originalname, {
            metadata: {
                originalName: req.file.originalname,
                hospitalId: req.hospital.id,
                type: field,
                mimetype: req.file.mimetype
            }
        });

        // Use streamifier to convert buffer to stream and pipe to GridFS
        const fileId = uploadStream.id;

        await new Promise((resolve, reject) => {
            streamifier.createReadStream(req.file.buffer)
                .pipe(uploadStream)
                .on('error', reject)
                .on('finish', resolve);
        });

        console.log(`✅ /upload: File streamed to GridFS with ID: ${fileId}`);

        // Update hospital document
        await Hospital.findByIdAndUpdate(req.hospital.id, {
            $set: {
                [`attachments.${field}`]: fileId,
                [`${field}_attached`]: true
            }
        });

        console.log(`🎉 /upload: Finished successfully!`);
        res.json({
            success: true,
            fileId: fileId,
            filename: req.file.originalname,
            message: 'File uploaded and linked successfully'
        });
    } catch (err) {
        console.error(`❌ /upload: Critical Error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/hospital-auth/submit — Final submission (requires hospital token)
router.post('/submit', hospitalAuth, async (req, res) => {
    try {
        // Fetch fresh hospital data to ensure we have the latest attachments after any concurrent uploads
        const hospital = await Hospital.findById(req.hospital.id);
        if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
        if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
        if (hospital.has_submitted) {
            return res.status(409).json({ error: 'Already submitted' });
        }

        // --- CLEANUP ORPHANED FILES START ---
        console.log(`🧹 /submit: Starting orphaned file cleanup for hospital: ${req.hospital.id}`);
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads'
        });

        // 1. Get all file references currently linked to the hospital
        const activeFileIds = Object.values(hospital.attachments || {})
            .filter(id => id != null)
            .map(id => id.toString());

        // 2. Find all files in GridFS metadata linked to this hospitalId
        const hospitalFiles = await mongoose.connection.db.collection('uploads.files')
            .find({ "metadata.hospitalId": req.hospital.id })
            .toArray();

        // 3. Delete files that are not in the active list
        let deletedCount = 0;
        for (const file of hospitalFiles) {
            if (!activeFileIds.includes(file._id.toString())) {
                await bucket.delete(file._id);
                deletedCount++;
            }
        }
        console.log(`✅ /submit: Cleaned up ${deletedCount} orphaned files.`);
        // --- CLEANUP ORPHANED FILES END ---

        hospital.has_submitted = true;
        hospital.submitted_at = new Date();
        hospital.status = 'pending';
        await hospital.save();

        res.json({
            success: true,
            message: 'Application submitted successfully',
            cleanedUp: deletedCount
        });
    } catch (err) {
        console.error(`❌ /submit Error: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
});

// POST /api/hospital-auth/remove-upload — Remove an attachment link from hospital document
router.post('/remove-upload', hospitalAuth, async (req, res) => {
    try {
        const { field } = req.body;
        if (!field) return res.status(400).json({ error: 'Field name required' });

        console.log(`🗑️ /remove-upload: Removing field ${field} for hospital ${req.hospital.id}`);

        // Use $unset to surgically remove the field from the attachments object
        // This avoids calling .save() and triggering validation on other fields (like nodal_contacts)
        await Hospital.findByIdAndUpdate(req.hospital.id, {
            $unset: { [`attachments.${field}`]: "" }
        });

        res.json({ success: true, message: 'Attachment removed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/hospital-auth/files/:id — Hospital: download own file from GridFS
router.get('/files/:id', hospitalAuth, async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.id);
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads'
        });

        // Check if file exists and belongs to this hospital
        const files = await mongoose.connection.db.collection('uploads.files').find({ 
            _id: fileId,
            "metadata.hospitalId": req.hospital.id 
        }).toArray();

        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'File not found or access denied' });
        }

        const file = files[0];
        let contentType = file.metadata?.mimetype || file.contentType || 'application/octet-stream';
        
        // Fallback for older files missing explicit mimetype
        if (contentType === 'application/octet-stream') {
            const originalName = file.metadata?.originalName || file.filename || '';
            if (originalName.match(/\.pdf$/i)) contentType = 'application/pdf';
            else if (originalName.match(/\.png$/i)) contentType = 'image/png';
            else if (originalName.match(/\.jpe?g$/i)) contentType = 'image/jpeg';
        }
        
        res.set('Content-Type', contentType);
        res.set('Content-Disposition', `attachment; filename="${file.metadata?.originalName || file.filename}"`);

        const downloadStream = bucket.openDownloadStream(fileId);
        downloadStream.pipe(res);
    } catch (err) {
        console.error(`❌ Download Error: ${err.message}`);
        res.status(400).json({ error: 'Invalid file ID or error downloading' });
    }
});

module.exports = router;
