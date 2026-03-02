// Shared scoring utilities — called directly on plain objects (lean docs)
// so that scoring works regardless of Mongoose virtual limitations.

function clamp(v, min = 0, max = 100) {
    if (v === null || v === undefined || isNaN(v)) return 0;
    return Math.min(max, Math.max(min, v));
}

function norm(val, worst, best) {
    if (best === worst) return 50;
    return clamp(((val - worst) / (best - worst)) * 100);
}

function computePatientOutcomes(h) {
    const scores = [];
    if (h.patient_outcome_score != null) scores.push(clamp(h.patient_outcome_score));
    if (h.surgery_success_rate != null) scores.push(clamp(h.surgery_success_rate));
    if (h.mortality_rate != null) scores.push(norm(h.mortality_rate, 10, 0));
    if (h.readmission_rate != null) scores.push(norm(h.readmission_rate, 20, 0));
    if (h.avg_length_of_stay != null) scores.push(norm(h.avg_length_of_stay, 15, 3));
    return scores.length ? clamp(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
}

function computeInfrastructure(h) {
    const scores = [];
    if (h.total_beds) scores.push(norm(h.total_beds, 50, 1000));
    if (h.icu_beds && h.total_beds) scores.push(norm(h.icu_beds / h.total_beds * 100, 0, 20));
    if (h.ot_rooms) scores.push(norm(h.ot_rooms, 0, 20));
    if (h.specialties?.length) scores.push(norm(h.specialties.length, 0, 30));
    const infraBools = [h.pharmacy_24x7, h.blood_bank, h.helipad, h.modular_ot, h.nabl_lab];
    scores.push((infraBools.filter(Boolean).length / infraBools.length) * 100);
    return scores.length ? clamp(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
}

function computeStaffQuality(h) {
    const scores = [];
    if (h.total_doctors && h.total_beds) scores.push(norm(h.total_doctors / h.total_beds, 0, 1));
    if (h.staff_to_bed_ratio != null) scores.push(norm(h.staff_to_bed_ratio, 0, 3));
    if (h.specialists_count) scores.push(norm(h.specialists_count, 0, 50));
    if (h.doctor_experience_avg) scores.push(norm(h.doctor_experience_avg, 1, 20));
    return scores.length ? clamp(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
}

function computeFinancialHealth(h) {
    const scores = [];
    if (h.annual_revenue != null) scores.push(norm(h.annual_revenue, 5, 500));
    if (h.cost_per_bed != null) scores.push(norm(h.cost_per_bed, 50, 5));
    if (h.insurance_tie_ups != null) scores.push(norm(h.insurance_tie_ups, 0, 20));
    if (h.outstanding_debt_ratio != null) scores.push(norm(h.outstanding_debt_ratio, 60, 0));
    scores.push(h.govt_scheme_participation ? 80 : 20);
    return scores.length ? clamp(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
}

function computeTechnology(h) {
    const bools = [
        h.his_emr_software, h.telemedicine, h.ai_diagnostic_tools,
        h.robotic_surgery, h.digital_records, h.mobile_app_patients, h.iot_monitoring,
    ];
    return clamp((bools.filter(Boolean).length / bools.length) * 100);
}

function computePatientSatisfaction(h) {
    const scores = [];
    if (h.patient_satisfaction_score != null) scores.push(clamp(h.patient_satisfaction_score));
    if (h.complaint_resolution_rate != null) scores.push(clamp(h.complaint_resolution_rate));
    if (h.infection_control_rate != null) scores.push(norm(h.infection_control_rate, 10, 0));
    if (h.emergency_response_time != null) scores.push(norm(h.emergency_response_time, 60, 5));
    if (h.avg_wait_time_opd != null) scores.push(norm(h.avg_wait_time_opd, 120, 10));
    return scores.length ? clamp(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
}

function computeAccreditation(h) {
    let score = 0;
    if (h.nabh_accredited) score += 35;
    if (h.jci_accredited) score += 35;
    if (h.nabl_lab) score += 15;
    if (h.iso_certified) score += 15;
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
