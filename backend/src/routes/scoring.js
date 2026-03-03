const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const ScoringConfig = require('../models/ScoringConfig');
const auth = require('../middleware/auth');
const { computeCategoryScores } = require('../utils/computeScores');

function computeOverallScore(categoryScores, weights) {
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    if (totalWeight === 0) return 0;
    let score = 0;
    for (const [key, weight] of Object.entries(weights)) {
        score += (categoryScores[key] || 0) * weight;
    }
    return Math.round(score / totalWeight);
}

// GET /api/scoring/config
router.get('/config', auth, async (req, res) => {
    try {
        let config = await ScoringConfig.findOne({ name: 'default' });
        if (!config) {
            config = await ScoringConfig.create({ name: 'default' });
        }
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/scoring/config
router.put('/config', auth, async (req, res) => {
    try {
        const config = await ScoringConfig.findOneAndUpdate(
            { name: 'default' },
            { weights: req.body.weights, updatedBy: req.admin.username },
            { new: true, upsert: true }
        );
        res.json(config);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/scoring/rank — Ranked hospitals
router.get('/rank', auth, async (req, res) => {
    try {
        let config = await ScoringConfig.findOne({ name: 'default' });
        if (!config) config = await ScoringConfig.create({ name: 'default' });
        const weights = config.weights.toObject ? config.weights.toObject() : config.weights;

        const hospitals = await Hospital.find().lean();

        const ranked = hospitals
            .map(h => {
                const cs = computeCategoryScores(h);
                const overallScore = computeOverallScore(cs, weights);
                return { ...h, overallScore, categoryScores: cs };
            })
            .sort((a, b) => b.overallScore - a.overallScore)
            .map((h, idx) => ({ ...h, rank: idx + 1 }));

        res.json({ hospitals: ranked, config, total: ranked.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/scoring/rank — Rank with supplied weights (no save)
router.post('/rank', auth, async (req, res) => {
    try {
        const weights = req.body.weights;
        const hospitals = await Hospital.find().lean();

        const ranked = hospitals
            .map(h => {
                const cs = computeCategoryScores(h);
                const overallScore = computeOverallScore(cs, weights);
                return { ...h, overallScore, categoryScores: cs };
            })
            .sort((a, b) => b.overallScore - a.overallScore)
            .map((h, idx) => ({ ...h, rank: idx + 1 }));

        res.json({ hospitals: ranked, total: ranked.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/scoring/factors
router.get('/factors', auth, (req, res) => {
    res.json({
        factors: [
            { key: 'patient_outcomes', label: 'Patient Outcomes', description: 'Outcome scores, surgery success, mortality & readmission rates', color: '#6366f1' },
            { key: 'infrastructure', label: 'Infrastructure', description: 'Bed capacity, ICU ratio, OT rooms, specialties & facilities', color: '#10b981' },
            { key: 'staff_quality', label: 'Staff Quality', description: 'Doctor-to-bed ratio, specialist count, experience average', color: '#f59e0b' },
            { key: 'financial_health', label: 'Financial Health', description: 'Revenue, cost efficiency, insurance tie-ups, debt ratio', color: '#ef4444' },
            { key: 'technology', label: 'Technology Adoption', description: 'EMR, telemedicine, AI tools, robotic surgery, IoT monitoring', color: '#8b5cf6' },
            { key: 'patient_satisfaction', label: 'Patient Satisfaction', description: 'Satisfaction score, complaint resolution, wait times, infection control', color: '#06b6d4' },
            { key: 'accreditation', label: 'Accreditation & Compliance', description: 'NABH, JCI, NABL, ISO certifications', color: '#f97316' },
        ]
    });
});

// GET /api/scoring/stats
router.get('/stats', auth, async (req, res) => {
    try {
        const hospitals = await Hospital.find().lean();
        let config = await ScoringConfig.findOne({ name: 'default' });
        if (!config) config = await ScoringConfig.create({ name: 'default' });
        const weights = config.weights.toObject ? config.weights.toObject() : config.weights;

        const ranked = hospitals.map(h => ({
            ...h,
            overallScore: computeOverallScore(computeCategoryScores(h), weights),
        }));

        const total = ranked.length;
        const avgScore = total ? Math.round(ranked.reduce((s, h) => s + h.overallScore, 0) / total) : 0;
        const topHospital = ranked.sort((a, b) => b.overallScore - a.overallScore)[0];
        const selectedCount = hospitals.filter(h => h.selected).length;

        // New Metrics
        const totalBeds = hospitals.reduce((sum, h) => sum + (h.capacity?.total_beds || 0), 0);
        const avgBeds = total ? Math.round(totalBeds / total) : 0;
        const totalDoctors = hospitals.reduce((sum, h) => sum + (h.staff?.total_doctors || 0), 0);
        const avgDoctors = total ? Math.round(totalDoctors / total) : 0;
        const accreditedCount = hospitals.filter(h => h.accreditations?.nabh || h.accreditations?.jci).length;

        const typeDistribution = {};
        hospitals.forEach(h => { typeDistribution[h.type] = (typeDistribution[h.type] || 0) + 1; });

        const stateDistribution = {};
        hospitals.forEach(h => { stateDistribution[h.state] = (stateDistribution[h.state] || 0) + 1; });

        res.json({
            total,
            avgScore,
            topHospital: topHospital?.name,
            selectedCount,
            typeDistribution,
            stateDistribution,
            totalBeds,
            avgBeds,
            totalDoctors,
            avgDoctors,
            accreditedCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
