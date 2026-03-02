const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const ScoringConfig = require('../models/ScoringConfig');
const auth = require('../middleware/auth');

function computeOverallScore(categoryScores, weights) {
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    if (totalWeight === 0) return 0;
    let score = 0;
    for (const [key, weight] of Object.entries(weights)) {
        score += (categoryScores[key] || 0) * weight;
    }
    return Math.round(score / totalWeight);
}

function flattenHospital(h, overallScore) {
    return {
        'Name': h.name,
        'Type': h.type,
        'City': h.city,
        'State': h.state,
        'Overall Score': overallScore,
        'Patient Outcomes': Math.round(h.categoryScores?.patient_outcomes || 0),
        'Infrastructure': Math.round(h.categoryScores?.infrastructure || 0),
        'Staff Quality': Math.round(h.categoryScores?.staff_quality || 0),
        'Financial Health': Math.round(h.categoryScores?.financial_health || 0),
        'Technology': Math.round(h.categoryScores?.technology || 0),
        'Patient Satisfaction': Math.round(h.categoryScores?.patient_satisfaction || 0),
        'Accreditation': Math.round(h.categoryScores?.accreditation || 0),
        'Total Beds': h.total_beds,
        'ICU Beds': h.icu_beds,
        'NABH': h.nabh_accredited ? 'Yes' : 'No',
        'JCI': h.jci_accredited ? 'Yes' : 'No',
        'Selected': h.selected ? 'Yes' : 'No',
        'Status': h.status,
        'Email': h.contact_email,
        'Submitted At': h.submitted_at,
    };
}

// GET /api/export/csv — all hospitals
router.get('/csv', auth, async (req, res) => {
    try {
        let config = await ScoringConfig.findOne({ name: 'default' });
        if (!config) config = await ScoringConfig.create({ name: 'default' });
        const weights = config.weights.toObject ? config.weights.toObject() : config.weights;

        const hospitals = await Hospital.find().lean({ virtuals: true });
        const rows = hospitals
            .map(h => ({ ...h, overallScore: computeOverallScore(h.categoryScores || {}, weights) }))
            .sort((a, b) => b.overallScore - a.overallScore)
            .map(h => flattenHospital(h, h.overallScore));

        const headers = Object.keys(rows[0] || {});
        const csvLines = [
            headers.join(','),
            ...rows.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
        ];

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="hospitals_export.csv"');
        res.send(csvLines.join('\n'));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/export/selected — only selected hospitals
router.get('/selected', auth, async (req, res) => {
    try {
        let config = await ScoringConfig.findOne({ name: 'default' });
        if (!config) config = await ScoringConfig.create({ name: 'default' });
        const weights = config.weights.toObject ? config.weights.toObject() : config.weights;

        const hospitals = await Hospital.find({ selected: true }).lean({ virtuals: true });
        const rows = hospitals
            .map(h => ({ ...h, overallScore: computeOverallScore(h.categoryScores || {}, weights) }))
            .sort((a, b) => b.overallScore - a.overallScore)
            .map(h => flattenHospital(h, h.overallScore));

        const headers = Object.keys(rows[0] || {});
        const csvLines = [
            headers.join(','),
            ...rows.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
        ];

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="selected_hospitals.csv"');
        res.send(csvLines.join('\n'));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
