const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// GET /api/hospitals/files/:id — Admin: download file from GridFS
router.get('/files/:id', auth, async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.id);
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads'
        });

        // Check if file exists
        const files = await mongoose.connection.db.collection('uploads.files').find({ _id: fileId }).toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = files[0];
        res.set('Content-Type', file.contentType || 'application/octet-stream');
        res.set('Content-Disposition', `attachment; filename="${file.metadata?.originalName || file.filename}"`);

        const downloadStream = bucket.openDownloadStream(fileId);
        downloadStream.pipe(res);
    } catch (err) {
        res.status(400).json({ error: 'Invalid file ID or error downloading' });
    }
});

// GET /api/hospitals/:id/documents/:key — Admin: download a specific hospital document
router.get('/:id/documents/:key', auth, async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

        const key = req.params.key;
        const fileId = hospital.attachments?.[key];
        if (!fileId) return res.status(404).json({ error: 'Document not found' });

        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads'
        });

        const files = await mongoose.connection.db.collection('uploads.files').find({ _id: fileId }).toArray();
        if (!files || files.length === 0) return res.status(404).json({ error: 'File data missing in storage' });

        const file = files[0];
        res.set('Content-Type', file.contentType || 'application/pdf');
        res.set('Content-Disposition', `attachment; filename="${file.metadata?.originalName || file.filename}"`);

        bucket.openDownloadStream(fileId).pipe(res);
    } catch (err) {
        console.error(`❌ Download Error: ${err.message}`);
        res.status(500).json({ error: 'Error processing download' });
    }
});

// POST /api/hospitals — Hospital submits data (public)
router.post('/', async (req, res) => {
    try {
        const hospital = new Hospital(req.body);
        await hospital.save();
        res.status(201).json({ success: true, message: 'Hospital data submitted successfully!', id: hospital._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/hospitals — Admin: list all hospitals
router.get('/', auth, async (req, res) => {
    try {
        const { search, type, status, sort_by, order } = req.query;
        const filter = {};
        if (search) filter.name = { $regex: search, $options: 'i' };
        if (type) filter.type = type;
        if (status) filter.status = status;

        const hospitals = await Hospital.find(filter).lean({ virtuals: true });
        res.json({ hospitals, total: hospitals.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/hospitals/:id — Admin: get single hospital
router.get('/:id', auth, async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id).lean({ virtuals: true });
        if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
        res.json(hospital);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/hospitals/:id/select — Toggle selection
router.patch('/:id/select', auth, async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
        hospital.selected = !hospital.selected;
        hospital.status = hospital.selected ? 'selected' : 'reviewed';
        await hospital.save();
        res.json({ success: true, selected: hospital.selected });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/hospitals/:id/revert — Admin: reset submission status
router.patch('/:id/revert', auth, async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndUpdate(
            req.params.id,
            { 
                has_submitted: false,
                status: 'draft',
                current_step: 1 // Force portal to land on Step 1 after login
            },
            { new: true, runValidators: false }
        );
        
        if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
        
        res.json({ success: true, message: 'Submission reverted to draft status' });
    } catch (err) {
        console.error('❌ Revert Error:', err);
        res.status(500).json({ error: 'Revert failed: ' + err.message });
    }
});

// PATCH /api/hospitals/:id/status — Update status and notes
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status, notes } = req.body;
        const hospital = await Hospital.findByIdAndUpdate(
            req.params.id,
            { status, notes },
            { new: true }
        ).lean({ virtuals: true });
        if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
        res.json(hospital);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/hospitals/:id — Admin: delete hospital
router.delete('/:id', auth, async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

        // Cleanup associated GridFS files
        if (hospital.attachments) {
            const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
                bucketName: 'uploads'
            });

            // Iterate through attachment keys and delete if valid ObjectId
            for (const key in hospital.attachments) {
                const fileId = hospital.attachments[key];
                if (fileId && mongoose.Types.ObjectId.isValid(fileId)) {
                    try {
                        await bucket.delete(new mongoose.Types.ObjectId(fileId));
                    } catch (err) {
                        console.warn(`⚠️ GridFS Cleanup (FileID: ${fileId}): ${err.message}`);
                    }
                }
            }
        }

        await Hospital.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Hospital and all associated documents deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
