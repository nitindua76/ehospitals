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
        'Hospital Name': h.name,
        'Brand Name': h.brand_name || 'N/A',
        'Type': h.type,
        'Sector': h.ownership_type || 'N/A',
        'City': h.city,
        'State': h.state,
        'Address': (h.address || '').replace(/,/g, ' '),
        'Primary Phone': h.contact_phone || 'N/A',
        'Primary Email': h.contact_email || 'N/A',
        'MSME Registered': h.msme_status || 'No',
        'MSME Type': h.msme_type || 'N/A',
        'PAN Number': h.pan_number || 'N/A',
        'GST Number': h.gst_number || 'N/A',
        'Overall Score': overallScore,
        'Capacity - Total Beds': h.total_beds || 0,
        'Capacity - General': h.capacity?.general || 0,
        'Capacity - ICU': h.capacity?.icu || 0,
        'Capacity - HDU': h.capacity?.hdu || 0,
        'Staff - Paramedical': h.paramedical_staff_count || 0,
        'Staff - Support': h.support_staff_count || 0,
        'Consultants Count': h.consultants?.length || 0,
        'Specialties': (h.specialties || []).join('; '),
        'Emergency 24x7': h.facilities?.emergency ? 'Yes' : 'No',
        'Blood Bank': h.facilities?.blood_bank ? 'Yes' : 'No',
        'Dialysis Unit': h.facilities?.dialysis ? 'Yes' : 'No',
        'Cathlab': h.facilities?.cathlab ? 'Yes' : 'No',
        'Ventilator': h.facilities?.ventilator ? 'Yes' : 'No',
        'CT Scan': h.diagnostic_facilities?.ct === 'Yes' ? 'Yes' : 'No',
        'MRI': h.diagnostic_facilities?.mri === 'Yes' ? 'Yes' : 'No',
        'PET-CT': h.diagnostic_facilities?.pet_ct === 'Yes' ? 'Yes' : 'No',
        'NABH Accredited': h.accreditations?.nabh ? 'Yes' : 'No',
        'JCI Accredited': h.accreditations?.jci ? 'Yes' : 'No',
        'NABL Accredited': h.accreditations?.nabl ? 'Yes' : 'No',
        'Clearance - Fire Safety': h.statutory_clearances?.fire_safety ? 'Yes' : 'No',
        'Clearance - BMW': h.statutory_clearances?.biomedical_waste ? 'Yes' : 'No',
        'Clearance - AERB': h.statutory_clearances?.aerb_approval ? 'Yes' : 'No',
        'Clearance - Pharmacy': h.statutory_clearances?.pharmacy_license ? 'Yes' : 'No',
        'CGHS Rates Acceptable': h.cghs_rates_acceptable || 'No',
        'ONGC Discount %': h.ongc_discount_percent || 0,
        'Bank ECS Available': h.bank_ecs_attached ? 'Yes' : 'No',
        'Selected for Panel': h.selected ? 'Yes' : 'No',
        'Current Status': h.status,
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
