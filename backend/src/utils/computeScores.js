// Shared scoring utilities — called directly on plain objects (lean docs)
// Aligned with Hospital model and seed data structure.

function clamp(v, min = 0, max = 100) {
    if (v === null || v === undefined || isNaN(v)) return 0;
    return Math.min(max, Math.max(min, v));
}

function norm(val, worst, best) {
    if (best === worst) return 50;
    return clamp(((val - worst) / (best - worst)) * 100);
}

function computePatientOutcomes(h) {
    // Proxy: total patients handled in last 2 cycles
    const total = (h.ongc_patient_count?.fy_23_24 || 0) + (h.ongc_patient_count?.fy_24_25 || 0);
    return total > 200 ? 95 : total > 100 ? 80 : total > 50 ? 65 : 50;
}

function computeInfrastructure(h) {
    const scores = [];
    if (h.total_beds) scores.push(norm(h.total_beds, 50, 1000));
    // Seed uses h.capacity.icu
    if (h.capacity?.icu && h.total_beds) scores.push(norm((h.capacity.icu / h.total_beds) * 100, 0, 20));

    // Statutory clearances
    const cl = h.statutory_clearances || {};
    const clScore = (Object.values(cl).filter(Boolean).length / 6) * 100;
    scores.push(clScore);

    // Facilities
    const fac = h.facilities || {};
    const facScore = (Object.values(fac).filter(Boolean).length / 9) * 100; // Seed has ~9 facility booleans
    scores.push(facScore);

    return scores.length ? clamp(scores.reduce((a, b) => a + b, 0) / scores.length) : 50;
}

function computeStaffQuality(h) {
    const scores = [];
    const totalConsultants = h.consultants?.length || 0;
    scores.push(norm(totalConsultants, 0, 50));

    if (h.paramedical_staff_count) scores.push(norm(h.paramedical_staff_count, 0, 500));

    // Experience avg from consultants
    if (totalConsultants > 0) {
        const avgExp = h.consultants.reduce((acc, c) => acc + (c.experience_years || 0), 0) / totalConsultants;
        scores.push(norm(avgExp, 1, 20));
    }

    return scores.length ? clamp(scores.reduce((a, b) => a + b, 0) / scores.length) : 50;
}

function computeFinancialHealth(h) {
    let score = 50;
    if (h.cghs_rates_acceptable === 'Yes') score += 20;
    if (h.ongc_discount_percent > 10) score += 20;
    if (h.bank_ecs_attached) score += 10;
    return clamp(score);
}

function computeTechnology(h) {
    const diag = h.diagnostic_facilities || {};
    const diagBools = [diag.ct === 'Yes', diag.mri === 'Yes', diag.pet_ct === 'Yes'];
    const diagScore = (diagBools.filter(Boolean).length / 3) * 100;

    // Tech adoption from facilities
    const hasTech = h.facilities?.ventilator ? 100 : 50;

    return clamp((diagScore + hasTech) / 2);
}

function computePatientSatisfaction(h) {
    return h.patient_feedbacks_attached ? 85 : 60;
}

function computeAccreditation(h) {
    let score = 0;
    const acc = h.accreditations || {};
    if (acc.nabh) score += 40;
    if (acc.jci) score += 40;
    if (acc.nabl) score += 20;
    return clamp(score);
}

function computeCategoryScores(h) {
    return {
        patient_outcomes: computePatientOutcomes(h),
        infrastructure: computeInfrastructure(h),
        staff_quality: computeStaffQuality(h),
        financial_health: computeFinancialHealth(h),
        technology: computeTechnology(h),
        patient_satisfaction: computePatientSatisfaction(h),
        accreditation: computeAccreditation(h),
    };
}

module.exports = { computeCategoryScores };
