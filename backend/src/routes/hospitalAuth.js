const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Hospital = require('../models/Hospital');
const { upload } = require('../utils/storage');
const hospitalAuth = require('../middleware/hospitalAuth');

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

// GET /api/hospital-auth/me — Hospital gets their own data (requires hospital token)
router.get('/me', require('../middleware/hospitalAuth'), async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.hospital.id).lean({ virtuals: true });
        if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
        // Exclude sensitive fields
        const { password, ...safeData } = hospital;
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

        const { username, password, status, selected, has_submitted, ...updateData } = req.body;
        const hospital = await Hospital.findByIdAndUpdate(
            req.hospital.id,
            { $set: updateData },
            { new: true, runValidators: false } // Relax validation for drafts
        ).lean({ virtuals: true });

        const { password: _p, ...safeData } = hospital;
        res.json({ success: true, hospital: safeData });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/hospital-auth/upload — Upload a file (requires hospital token)
router.post('/upload', hospitalAuth, upload.single('file'), async (req, res) => {
    try {
        const { field } = req.body; // e.g., 'pan', 'gst'
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        if (!field) return res.status(400).json({ error: 'Field name required' });

        await Hospital.findByIdAndUpdate(req.hospital.id, {
            $set: {
                [`attachments.${field}`]: req.file.id,
                [`${field}_attached`]: true
            }
        });

        res.json({
            success: true,
            fileId: req.file.id,
            filename: req.file.filename,
            message: 'File uploaded and linked successfully'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/hospital-auth/submit — Final submission (requires hospital token)
router.post('/submit', hospitalAuth, async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.hospital.id);
        if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
        if (hospital.has_submitted) {
            return res.status(409).json({ error: 'Already submitted' });
        }

        // Final validation can be done here if needed
        hospital.has_submitted = true;
        hospital.submitted_at = new Date();
        hospital.status = 'pending';
        await hospital.save();

        res.json({ success: true, message: 'Application submitted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
