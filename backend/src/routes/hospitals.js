const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const auth = require('../middleware/auth');

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
        await Hospital.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Hospital deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
