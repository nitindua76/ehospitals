const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const ScoringConfig = require('../models/ScoringConfig');
const auth = require('../middleware/auth');
const { computeCategoryScores } = require('../utils/computeScores');

const CRITERIA_REGISTRY = require('../utils/criteriaRegistry');

function getDeepValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function checkCriteria(h, key) {
    const config = CRITERIA_REGISTRY[key];
    if (!config) return true; // Default to passing if criteria unknown
    const value = getDeepValue(h, config.path);
    if (config.isEnum) {
        if (Array.isArray(config.expectedValue)) return config.expectedValue.includes(value);
        return value === config.expectedValue;
    }
    return !!value;
}

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
            {
                weights: req.body.weights,
                essentialFactors: req.body.essentialFactors,
                updatedBy: req.admin.username
            },
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

        // Fetch full Mongoose documents to ensure virtuals are computed
        const hospitals = await Hospital.find();
        const essentialFactors = config.essentialFactors || [];

        const ranked = hospitals
            .map(hospital => {
                const h = hospital.toJSON();
                const cs = computeCategoryScores(h);
                let overallScore = computeOverallScore(cs, weights);

                // Essential factor check
                const missingFactors = essentialFactors.map(f => {
                    const pass = checkCriteria(h, f);
                    if (!pass) return { key: f, ...CRITERIA_REGISTRY[f] };
                    return null;
                }).filter(Boolean);
                
                const ineligible = missingFactors.length > 0;

                if (ineligible) {
                    overallScore = Math.max(0, overallScore - 100); // Penalty for being ineligible
                }

                return { ...h, overallScore, categoryScores: cs, ineligible, missingFactors };
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
        const essentialFactors = req.body.essentialFactors || [];
        const hospitals = await Hospital.find().lean();

        const ranked = hospitals
            .map(h => {
                const cs = computeCategoryScores(h);
                let overallScore = computeOverallScore(cs, weights);

                // Essential factor check
                const missingFactors = essentialFactors.map(f => {
                    const pass = checkCriteria(h, f);
                    if (!pass) return { key: f, ...CRITERIA_REGISTRY[f] };
                    return null;
                }).filter(Boolean);
                
                const ineligible = missingFactors.length > 0;

                if (ineligible) {
                    overallScore = Math.max(0, overallScore - 100);
                }

                return { ...h, overallScore, categoryScores: cs, ineligible, missingFactors };
            })
            .sort((a, b) => b.overallScore - a.overallScore)
            .map((h, idx) => ({ ...h, rank: idx + 1 }));

        res.json({ hospitals: ranked, total: ranked.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/scoring/criteria - Full list of possible mandatory criteria
router.get('/criteria', auth, (req, res) => {
    res.json(CRITERIA_REGISTRY);
});

// GET /api/scoring/factors
router.get('/factors', auth, (req, res) => {
    res.json({
        factors: [
            { key: 'patient_outcomes', label: 'Patient Volume & Outcomes', description: 'Historical patient traffic from ONGC and outcome proxies', color: '#6366f1' },
            { key: 'infrastructure', label: 'Infrastructure & Bed Capacity', description: 'Total beds, ICU ratio, OT rooms and general facilities', color: '#10b981' },
            { key: 'staff_quality', label: 'Staff Quality & Experience', description: 'Doctor-to-bed ratio, specialist count, and clinical experience', color: '#f59e0b' },
            { key: 'financial_health', label: 'Financial Commitments', description: 'CGHS rate acceptance, ONGC discounts, and bank connectivity', color: '#ef4444' },
            { key: 'technology', label: 'Technology & Diagnostics', description: 'Diagnostic capabilities (MRI, CT) and medical tech adoption', color: '#8b5cf6' },
            { key: 'patient_satisfaction', label: 'Patient Experience', description: 'Feedback mechanisms and past patient satisfaction indicators', color: '#06b6d4' },
            { key: 'accreditation', label: 'Accreditation & Compliance', description: 'NABH, JCI, NABL, and critical statutory clearances', color: '#f97316' },
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

        const essentialFactors = config.essentialFactors || [];
        const ranked = hospitals.map(h => {
            const cs = computeCategoryScores(h);
            const missingFactors = essentialFactors.filter(f => !checkCriteria(h, f));
            return {
                ...h,
                overallScore: computeOverallScore(cs, weights),
                missingFactors
            };
        });

        const total = ranked.length;
        const avgScore = total ? Math.round(ranked.reduce((s, h) => s + h.overallScore, 0) / total) : 0;
        const topHospital = ranked.sort((a, b) => b.overallScore - a.overallScore)[0];
        const selectedCount = hospitals.filter(h => h.selected).length;
        const essentialCount = config.essentialFactors?.length || 0;
        const compliantCount = ranked.filter(h => (h.missingFactors || []).length === 0 && h.has_submitted).length;

        // New Metrics
        const totalBeds = hospitals.reduce((sum, h) => sum + (h.total_beds || 0), 0);
        const avgBeds = total ? Math.round(totalBeds / total) : 0;
        const totalDoctors = hospitals.reduce((sum, h) => sum + (h.consultants?.length || 0), 0);
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
