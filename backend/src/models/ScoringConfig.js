const mongoose = require('mongoose');

const scoringConfigSchema = new mongoose.Schema({
    name: { type: String, default: 'default' },
    weights: {
        patient_outcomes: { type: Number, default: 25, min: 0, max: 100 },
        infrastructure: { type: Number, default: 15, min: 0, max: 100 },
        staff_quality: { type: Number, default: 15, min: 0, max: 100 },
        financial_health: { type: Number, default: 10, min: 0, max: 100 },
        technology: { type: Number, default: 10, min: 0, max: 100 },
        patient_satisfaction: { type: Number, default: 15, min: 0, max: 100 },
        accreditation: { type: Number, default: 10, min: 0, max: 100 },
    },
    essentialFactors: { type: [String], default: [] },
    updatedBy: { type: String, default: 'admin' },
}, { timestamps: true });

module.exports = mongoose.model('ScoringConfig', scoringConfigSchema);
