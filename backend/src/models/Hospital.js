const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hospitalSchema = new mongoose.Schema({
  // CREDENTIALS (stored securely, only accessible to admin)
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true }, // bcrypt-hashed

  // SECTION A: BASIC DETAILS
  name: { type: String, required: true, trim: true },
  brand_name: { type: String, trim: true },
  pan_number: { type: String, trim: true },
  pan_attached: { type: Boolean, default: false },
  gst_number: { type: String, trim: true },
  gst_attached: { type: Boolean, default: false },
  msme_status: { type: String, enum: ['Yes', 'No'], default: 'No' },
  msme_type: { type: String, enum: ['Micro', 'Small', 'Medium', 'None'], default: 'None' },
  msme_attached: { type: Boolean, default: false },
  type: { type: String, enum: ['Single-Specialty', 'Multi-Specialty', 'Eye-Bank', 'EyeCare Center', 'Diagnostic-Center'], required: true },
  ownership_type: { type: String, enum: ['Government', 'Private', 'Private/Corporate', 'Trust', 'Corporate'], default: 'Private' },

  // SECTION B: ADDRESS & CONTACT DETAILS
  // SECTION B: ADDRESS & CONTACT DETAILS
  address: { type: String },
  city: { type: String },
  state: { type: String },
  contact_phone: { type: String },
  contact_email: { type: String },
  nodal_contacts: [{
    purpose: { type: String },
    name: String,
    designation: String,
    mobile: String,
    email: String
  }],

  // SECTION C: BANK & STATUTORY COMPLIANCE
  bank_ecs_attached: { type: Boolean, default: false },
  accreditations: {
    nabh: { type: Boolean, default: false },
    nabl: { type: Boolean, default: false },
    jci: { type: Boolean, default: false },
    not_accredited: { type: Boolean, default: false }
  },
  bank_details: {
    bank_name: { type: String, trim: true },
    account_no: { type: String, trim: true },
    ifsc_code: { type: String, trim: true },
    ecs_mandate_attached: { type: Boolean, default: false }
  },
  date_of_inception: { type: Date },
  panel_organizations: [{
    name: { type: String, trim: true },
    since_year: { type: Number }
  }],
  tpa_tieups: [{
    name: { type: String, trim: true }
  }],
  authorized_signatory: {
    name: { type: String, trim: true },
    designation: { type: String, trim: true },
    date: { type: Date }
  },
  accreditation_valid_until: Date,
  accreditation_attached: { type: Boolean, default: false },
  it_exemption: { type: String, enum: ['Yes', 'No'], default: 'No' },
  it_exemption_permanent: { type: String, enum: ['Yes', 'No'], default: 'No' },
  it_exemption_valid_until: Date,
  it_exemption_attached: { type: Boolean, default: false },
  statutory_clearances: {
    fire_safety: { type: Boolean, default: false },
    biomedical_waste: { type: Boolean, default: false },
    aerb_approval: { type: Boolean, default: false },
    pharmacy_license: { type: Boolean, default: false },
    lift_safety: { type: Boolean, default: false },
    cea_registration: { type: Boolean, default: false },
    pollution_control_certificate: { type: Boolean, default: false }
  },
  fire_safety_attached: { type: Boolean, default: false },
  biomedical_attached: { type: Boolean, default: false },
  pharmacy_attached: { type: Boolean, default: false },
  tariff_attached: { type: Boolean, default: false },

  // SECTION D: CLINICAL SERVICES
  specialties: [{ type: String }], // Searchable list from user request
  core_specialties: [{ type: String }], // From Section D checkboxes
  super_specialties: [{ type: String }], // From Section D checkboxes
  support_services: [{ type: String }], // From Section D checkboxes

  // SECTION E: FACILITIES AVAILABLE
  facilities: {
    advanced_trauma: { type: Boolean, default: false },
    blood_bank: { type: Boolean, default: false },
    dialysis: { type: Boolean, default: false },
    organ_transplant: { type: Boolean, default: false },
    burns_unit: { type: Boolean, default: false },
    ipd_psychiatry: { type: Boolean, default: false },
    ivf: { type: Boolean, default: false },
    cathlab: { type: Boolean, default: false },
    emergency: { type: Boolean, default: false },
    ventilator: { type: Boolean, default: false },
    nicu: { type: Boolean, default: false },
    picu: { type: Boolean, default: false },
    central_oxygen: { type: Boolean, default: false },
    icu: { type: Boolean, default: false },
    trauma: { type: Boolean, default: false },
    interventional_radiology: { type: Boolean, default: false },
    nuclear_medicine: { type: Boolean, default: false },
    physiotherapy: { type: Boolean, default: false },
    pain_management: { type: Boolean, default: false },
    palliative_care: { type: Boolean, default: false },
    air_ambulance: { type: Boolean, default: false },
    hearse_van: { type: Boolean, default: false },
    opd: { type: Boolean, default: false },
    ipd: { type: Boolean, default: false }
  },
  ambulance_facility: { type: String, enum: ['Yes', 'No', 'Basic', 'ALS'], default: 'No' },
  ambulance_free_pickup: { type: String, enum: ['Yes', 'No'], default: 'No' },
  diagnostic_facilities: {
    ct: { type: String, enum: ['Yes', 'No', 'No Scan', 'Single-Slice', 'Multi-Slice'], default: 'No' },
    mri: { type: String, enum: ['Not Available', 'InHouse', 'Outsourced'], default: 'Not Available' },
    pet_ct: { type: String, enum: ['Not Available', 'InHouse', 'Outsourced'], default: 'Not Available' },
    echo_cardiology: { type: String, enum: ['Yes', 'No'], default: 'No' },
    digital_xray: { type: Boolean, default: false },
    ultrasound: { type: Boolean, default: false },
    outsourced_info: String
  },

  // SECTION F: CAPACITY DETAILS
  capacity: {
    general: { type: Number, default: 0 },
    semi_private: { type: Number, default: 0 },
    private: { type: Number, default: 0 },
    private_single_ac: { type: Number, default: 0 },
    private_deluxe_ac: { type: Number, default: 0 },
    private_suite: { type: Number, default: 0 },
    icu: { type: Number, default: 0 },
    hdu: { type: Number, default: 0 }
  },
  total_beds: { type: Number, default: 0 },

  // SECTION G: SUPPORT SERVICES (Duplicate fields merged with facilities)
  pathology_lab: { type: String, enum: ['Yes', 'No'], default: 'No' },
  radiology_services: { type: String, enum: ['Yes', 'No'], default: 'No' },
  pharmacy_24x7: { type: String, enum: ['Yes', 'No'], default: 'No' },
  trauma_support_24x7: { type: String, enum: ['Yes', 'No'], default: 'No' },
  corporate_help_desk: { type: String, enum: ['Yes', 'No'], default: 'No' },

  // SECTION H: COMMERCIAL TERMS
  cghs_rates_acceptable: { type: String, enum: ['Yes', 'No'], default: 'No' },
  ongc_discount_percent: { type: Number, default: 0 },
  schedule_of_charges_attached: { type: Boolean, default: false },

  // SECTION I: EXPERIENCE & ASSOCIATION
  date_of_inception: { type: Date },
  hospital_age: { type: Number },
  outsourced_services: String,
  panel_organizations_attached: { type: Boolean, default: false },
  ongc_association_years: { type: Number, default: 0 },
  ongc_patient_count: {
    fy_22_23: { type: Number, default: 0 },
    fy_23_24: { type: Number, default: 0 },
    fy_24_25: { type: Number, default: 0 },
    period_25: { type: Number, default: 0 }
  },
  ongc_vendor_code: { type: String, trim: true },
  panel_organizations: [{
    name: String,
    since_year: Number
  }],
  tpa_tieups: [{
    name: String
  }],

  // SECTION J: MANPOWER & FEEDBACK
  consultants: [{
    name: String,
    specialty: String,
    type: { type: String, enum: ['Full time', 'Visiting'] },
    qualification: String,
    experience_years: Number,
    mobile: String
  }],
  paramedical_staff_count: { type: Number, default: 0 },
  support_staff_count: { type: Number, default: 0 },
  total_doctors: { type: Number, default: 0 },
  full_time_doctors: { type: Number, default: 0 },
  total_nursing_staff: { type: Number, default: 0 },
  full_time_nursing_staff: { type: Number, default: 0 },
  patient_feedbacks_attached: { type: Boolean, default: false },

  // SECTION K: OTHER FACILITIES
  general_facilities: {
    parking: { type: Boolean, default: false },
    power_backup: { type: Boolean, default: false },
    central_ac: { type: Boolean, default: false },
    waiting_lounge: { type: Boolean, default: false },
    cafeteria: { type: Boolean, default: false },
    attendant_lodging: { type: Boolean, default: false },
    mortuary: { type: Boolean, default: false }
  },

  // SECTION L: DECLARATION
  declaration_no_blacklisting: { type: Boolean, default: false },
  achievements: String,

  // SECTION M: DOCUMENTS (GridFS File IDs)
  attachments: {
    pan: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    gst: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    mse_certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    nabh_certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    nabl_certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    jci_certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    fire_safety: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    biomedical: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    aerb_approval: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    pollution_control: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    lift_safety: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    cea_registration: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    bank_ecs: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    tariff: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    mri_declaration: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    pet_ct_declaration: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' }
  },

  // Metadata & Analytics
  status: { type: String, enum: ['pending', 'reviewed', 'selected', 'rejected'], default: 'pending' },
  selected: { type: Boolean, default: false },
  has_submitted: { type: Boolean, default: false }, // locked after first form submit
  current_step: { type: Number, default: 1 },
  submitted_at: { type: Date }
}, {
  timestamps: true
});

// Ensure virtuals are included in JSON and Object outputs
hospitalSchema.set('toJSON', { virtuals: true });
hospitalSchema.set('toObject', { virtuals: true });

// --- VIRTUALS FOR FRONTEND COMPATIBILITY (Flat field support) ---
hospitalSchema.virtual('nabh_accredited').get(function () { return this.accreditations?.nabh ? 'Yes' : 'No'; });
hospitalSchema.virtual('nabl_accredited').get(function () { return this.accreditations?.nabl ? 'Yes' : 'No'; });
hospitalSchema.virtual('jci_accredited').get(function () { return this.accreditations?.jci ? 'Yes' : 'No'; });

hospitalSchema.virtual('fire_safety_clearance').get(function () { return this.statutory_clearances?.fire_safety ? 'Yes' : 'No'; });
hospitalSchema.virtual('biomedical_waste_clearance').get(function () { return this.statutory_clearances?.biomedical_waste ? 'Yes' : 'No'; });
hospitalSchema.virtual('aerb_approval').get(function () { return this.statutory_clearances?.aerb_approval ? 'Yes' : 'No'; });
hospitalSchema.virtual('pharmacy_license').get(function () { return this.statutory_clearances?.pharmacy_license ? 'Yes' : 'No'; });
hospitalSchema.virtual('lift_safety_clearance').get(function () { return this.statutory_clearances?.lift_safety ? 'Yes' : 'No'; });
hospitalSchema.virtual('cea_registration').get(function() { return this.statutory_clearances?.cea_registration ? 'Yes' : 'No'; });
hospitalSchema.virtual('pollution_control_certificate').get(function() { return this.statutory_clearances?.pollution_control_certificate ? 'Yes' : 'No'; });

hospitalSchema.virtual('emergency_department').get(function () { return this.facilities?.emergency ? 'Yes' : 'No'; });
hospitalSchema.virtual('blood_bank').get(function () { return this.facilities?.blood_bank ? 'Yes' : 'No'; });
hospitalSchema.virtual('cathlab').get(function () { return this.facilities?.cathlab ? 'Yes' : 'No'; });
hospitalSchema.virtual('organ_transplant').get(function () { return this.facilities?.organ_transplant ? 'Yes' : 'No'; });
hospitalSchema.virtual('dialysis_unit').get(function () { return this.facilities?.dialysis ? 'Yes' : 'No'; });
hospitalSchema.virtual('opd_services').get(function () { return this.facilities?.opd ? 'Yes' : 'No'; });
hospitalSchema.virtual('ipd_services').get(function () { return this.facilities?.ipd ? 'Yes' : 'No'; });

hospitalSchema.virtual('advanced_trauma_care').get(function () { return this.facilities?.advanced_trauma ? 'Yes' : 'No'; });
hospitalSchema.virtual('burns_unit').get(function () { return this.facilities?.burns_unit ? 'Yes' : 'No'; });
hospitalSchema.virtual('ipd_psychiatry').get(function () { return this.facilities?.ipd_psychiatry ? 'Yes' : 'No'; });
hospitalSchema.virtual('ivf_facility').get(function () { return this.facilities?.ivf ? 'Yes' : 'No'; });
hospitalSchema.virtual('ventilator_facility').get(function () { return this.facilities?.ventilator ? 'Yes' : 'No'; });
hospitalSchema.virtual('nicu_facility').get(function () { return this.facilities?.nicu ? 'Yes' : 'No'; });
hospitalSchema.virtual('picu_facility').get(function () { return this.facilities?.picu ? 'Yes' : 'No'; });
hospitalSchema.virtual('central_oxygen_supply').get(function () { return this.facilities?.central_oxygen ? 'Yes' : 'No'; });
hospitalSchema.virtual('icu_facility').get(function () { return this.facilities?.icu ? 'Yes' : 'No'; });
hospitalSchema.virtual('trauma_facility').get(function () { return this.facilities?.trauma ? 'Yes' : 'No'; });
hospitalSchema.virtual('interventional_radiology').get(function () { return this.facilities?.interventional_radiology ? 'Yes' : 'No'; });
hospitalSchema.virtual('nuclear_medicine').get(function () { return this.facilities?.nuclear_medicine ? 'Yes' : 'No'; });
hospitalSchema.virtual('physiotherapy').get(function () { return this.facilities?.physiotherapy ? 'Yes' : 'No'; });
hospitalSchema.virtual('pain_management').get(function () { return this.facilities?.pain_management ? 'Yes' : 'No'; });
hospitalSchema.virtual('palliative_care').get(function () { return this.facilities?.palliative_care ? 'Yes' : 'No'; });
hospitalSchema.virtual('air_ambulance_tieup').get(function () { return this.facilities?.air_ambulance ? 'Yes' : 'No'; });
hospitalSchema.virtual('hearse_van_tieup').get(function () { return this.facilities?.hearse_van ? 'Yes' : 'No'; });

hospitalSchema.virtual('ct_scan').get(function () { return this.diagnostic_facilities?.ct; });
hospitalSchema.virtual('mri_scan').get(function () { return this.diagnostic_facilities?.mri; });
hospitalSchema.virtual('pet_ct_scan').get(function () { return this.diagnostic_facilities?.pet_ct; });
hospitalSchema.virtual('echo_cardiology').get(function () { return this.diagnostic_facilities?.echo_cardiology; });
hospitalSchema.virtual('digital_xray').get(function () { return this.diagnostic_facilities?.digital_xray ? 'Yes' : 'No'; });
hospitalSchema.virtual('ultrasound').get(function () { return this.diagnostic_facilities?.ultrasound ? 'Yes' : 'No'; });

hospitalSchema.virtual('tariffs_attached').get(function () { return this.tariff_attached ? 'Yes' : 'No'; });
hospitalSchema.virtual('ongc_association').get(function () { return this.ongc_association_years > 0 ? 'Yes' : 'No'; });

hospitalSchema.virtual('ecs_mandate_attached').get(function() { return this.bank_details?.ecs_mandate_attached ? 'Yes' : 'No'; });
hospitalSchema.virtual('bank_name').get(function() { return this.bank_details?.bank_name; });
hospitalSchema.virtual('account_no').get(function() { return this.bank_details?.account_no; });
hospitalSchema.virtual('ifsc_code').get(function() { return this.bank_details?.ifsc_code; });

hospitalSchema.virtual('signatory_name').get(function() { return this.authorized_signatory?.name; });
hospitalSchema.virtual('signatory_designation').get(function() { return this.authorized_signatory?.designation; });
hospitalSchema.virtual('signatory_date').get(function() { return this.authorized_signatory?.date; });

// Hash password before saving
hospitalSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password helper
hospitalSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Virtual: computed category scores (0-100 each)
hospitalSchema.virtual('categoryScores').get(function () {
  return {
    patient_outcomes: computePatientOutcomes(this),
    infrastructure: computeInfrastructure(this),
    staff_quality: computeStaffQuality(this),
    financial_health: computeFinancialHealth(this),
    technology: computeTechnology(this),
    patient_satisfaction: computePatientSatisfaction(this),
    accreditation: computeAccreditation(this),
  };
});

hospitalSchema.pre('save', function (next) {
  if (this.capacity) {
    const c = this.capacity;
    this.total_beds = (c.general || 0) + (c.semi_private || 0) + (c.private || 0) +
                      (c.private_single_ac || 0) + (c.private_deluxe_ac || 0) + (c.private_suite || 0) +
                      (c.icu || 0) + (c.hdu || 0);
  }
  next();
});

hospitalSchema.set('toJSON', { virtuals: true });
hospitalSchema.set('toObject', { virtuals: true });

function clamp(v, min = 0, max = 100) {
  if (v === null || v === undefined || isNaN(v)) return 0;
  return Math.min(max, Math.max(min, v));
}

function norm(val, worst, best) {
  if (best === worst) return 50;
  return clamp(((val - worst) / (best - worst)) * 100);
}

function computePatientOutcomes(h) {
  // Section I: ONGC Patient counts as a proxy for experience/outcomes
  const total = (h.ongc_patient_count?.fy_22_23 || 0) + (h.ongc_patient_count?.fy_23_24 || 0) + (h.ongc_patient_count?.fy_24_25 || 0);
  return total > 150 ? 90 : total > 75 ? 75 : 50;
}

function computeInfrastructure(h) {
  const scores = [];
  if (h.total_beds) scores.push(norm(h.total_beds, 10, 500));
  if (h.capacity?.icu && h.total_beds) scores.push(norm(h.capacity.icu / h.total_beds * 100, 0, 20));

  const clearances = h.statutory_clearances || {};
  const clearanceScore = (Object.values(clearances).filter(Boolean).length / 6) * 100;
  scores.push(clearanceScore);

  const facilities = h.facilities || {};
  const facilityScore = (Object.values(facilities).filter(Boolean).length / 13) * 100;
  scores.push(facilityScore);

  return scores.length ? clamp(scores.reduce((a, b) => a + b, 0) / scores.length) : 50;
}

function computeStaffQuality(h) {
  const scores = [];
  const totalConsultants = h.consultants?.length || 0;
  scores.push(norm(totalConsultants, 0, 50));

  if (h.paramedical_staff_count) scores.push(norm(h.paramedical_staff_count, 0, 100));

  // Experience avg if available in consultants
  if (totalConsultants > 0) {
    const avgExp = h.consultants.reduce((acc, c) => acc + (c.experience_years || 0), 0) / totalConsultants;
    scores.push(norm(avgExp, 1, 20));
  }

  return scores.length ? clamp(scores.reduce((a, b) => a + b, 0) / scores.length) : 50;
}

function computeFinancialHealth(h) {
  let score = 60; // Base score adjusted
  if (h.bank_ecs_attached) score += 40;
  return clamp(score);
}

function computeTechnology(h) {
  const diag = h.diagnostic_facilities || {};
  const diagBools = [diag.ct === 'Yes', diag.mri === 'Yes', diag.pet_ct === 'Yes'];
  return clamp((diagBools.filter(Boolean).length / 3) * 100);
}

function computePatientSatisfaction(h) {
  return h.patient_feedbacks_attached ? 85 : 50;
}

function computeAccreditation(h) {
  let score = 0;
  const acc = h.accreditations || {};
  if (acc.nabh) score += 40;
  if (acc.jci) score += 40;
  if (acc.nabl) score += 20;
  return clamp(score);
}

module.exports = mongoose.model('Hospital', hospitalSchema);
