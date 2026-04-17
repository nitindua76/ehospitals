const CRITERIA_REGISTRY = {
    // ACCREDITATIONS
    'nabh': { label: 'NABH Accreditation', path: 'accreditations.nabh', icon: '📜', category: 'Accreditation' },
    'nabl': { label: 'NABL Certification', path: 'accreditations.nabl', icon: '🔬', category: 'Accreditation' },
    'jci': { label: 'JCI Accreditation', path: 'accreditations.jci', icon: '🌍', category: 'Accreditation' },

    // STATUTORY CLEARANCES
    'fire_safety': { label: 'Fire Safety NOC', path: 'statutory_clearances.fire_safety', icon: '🔥', category: 'Statutory' },
    'biomedical_waste': { label: 'Biomedical Waste Mgmt', path: 'statutory_clearances.biomedical_waste', icon: '🧫', category: 'Statutory' },
    'aerb_approval': { label: 'AERB Approval', path: 'statutory_clearances.aerb_approval', icon: '☢️', category: 'Statutory' },
    'pharmacy_license': { label: 'Pharmacy License', path: 'statutory_clearances.pharmacy_license', icon: '💊', category: 'Statutory' },
    'lift_safety': { label: 'Lift Safety Clearance', path: 'statutory_clearances.lift_safety', icon: '🛗', category: 'Statutory' },
    'cea_registration': { label: 'CEA Registration', path: 'statutory_clearances.cea_registration', icon: '📋', category: 'Statutory' },
    'pollution_control': { label: 'Pollution Control Cert', path: 'statutory_clearances.pollution_control_certificate', icon: '🍃', category: 'Statutory' },

    // CRITICAL FACILITIES
    'emergency': { label: '24x7 Emergency Services', path: 'facilities.emergency', icon: '🏥', category: 'Facilities' },
    'blood_bank': { label: 'In-house Blood Bank', path: 'facilities.blood_bank', icon: '🩸', category: 'Facilities' },
    'icu': { label: 'ICU / CCU Facility', path: 'facilities.icu', icon: '❤️', category: 'Facilities' },
    'ventilator': { label: 'Ventilator Facility', path: 'facilities.ventilator', icon: '🌬️', category: 'Facilities' },
    'cathlab': { label: 'Cardiac Cath Lab', path: 'facilities.cathlab', icon: '🫀', category: 'Facilities' },
    'dialysis': { label: 'Dialysis Unit', path: 'facilities.dialysis', icon: '🧪', category: 'Facilities' },
    'organ_transplant': { label: 'Organ Transplant Unit', path: 'facilities.organ_transplant', icon: '🧬', category: 'Facilities' },
    'advanced_trauma': { label: 'Advanced Trauma Care', path: 'facilities.advanced_trauma', icon: '🩹', category: 'Facilities' },
    'burns_unit': { label: 'Specialized Burns Unit', path: 'facilities.burns_unit', icon: '🩹', category: 'Facilities' },
    'nicu': { label: 'NICU Facility', path: 'facilities.nicu', icon: '👶', category: 'Facilities' },
    'picu': { label: 'PICU Facility', path: 'facilities.picu', icon: '🧸', category: 'Facilities' },
    'interventional_radiology': { label: 'Interv. Radiology', path: 'facilities.interventional_radiology', icon: '📡', category: 'Facilities' },
    'nuclear_medicine': { label: 'Nuclear Medicine', path: 'facilities.nuclear_medicine', icon: '⚛️', category: 'Facilities' },
    'air_ambulance': { label: 'Air Ambulance Tie-up', path: 'facilities.air_ambulance', icon: '🚁', category: 'Facilities' },
    'physiotherapy': { label: 'Physiotherapy unit', path: 'facilities.physiotherapy', icon: '🏃', category: 'Facilities' },
    'pain_management': { label: 'Pain Management unit', path: 'facilities.pain_management', icon: '🧘', category: 'Facilities' },
    'palliative_care': { label: 'Palliative Care unit', path: 'facilities.palliative_care', icon: '🤝', category: 'Facilities' },
    'ambulance': { label: 'Ambulance Facility', path: 'ambulance_facility', icon: '🚑', category: 'Facilities', isEnum: true, expectedValue: ['Yes', 'Basic', 'ALS'] },

    // DIAGNOSTIC CAPABILITY
    'ct_scan': { label: 'CT Scan Facility', path: 'diagnostic_facilities.ct', icon: '💿', category: 'Diagnostics', isEnum: true, expectedValue: 'Yes' },
    'mri_scan': { label: 'MRI Scan Facility', path: 'diagnostic_facilities.mri', icon: '🧲', category: 'Diagnostics', isEnum: true, expectedValue: 'InHouse' },
    'pet_ct': { label: 'PET-CT Scan', path: 'diagnostic_facilities.pet_ct', icon: '✨', category: 'Diagnostics', isEnum: true, expectedValue: 'InHouse' },
    'echo': { label: 'Echo Cardiology', path: 'diagnostic_facilities.echo_cardiology', icon: '💓', category: 'Diagnostics', isEnum: true, expectedValue: 'Yes' },
    'digital_xray': { label: 'Digital X-Ray', path: 'diagnostic_facilities.digital_xray', icon: '☠️', category: 'Diagnostics' },
    'ultrasound': { label: 'Ultrasound Facility', path: 'diagnostic_facilities.ultrasound', icon: '🌊', category: 'Diagnostics' },

    // INFRASTRUCTURE & AMENITIES
    'central_oxygen': { label: 'Central Oxygen Supply', path: 'facilities.central_oxygen', icon: '🌬️', category: 'Infrastructure' },
    'power_backup': { label: 'Dual Power Backup', path: 'general_facilities.power_backup', icon: '⚡', category: 'Infrastructure' },
    'central_ac': { label: 'Central Air Conditioning', path: 'general_facilities.central_ac', icon: '❄️', category: 'Infrastructure' },
    'parking': { label: 'Ample Parking Space', path: 'general_facilities.parking', icon: '🅿️', category: 'Infrastructure' },
    'mortuary': { label: 'Mortuary Services', path: 'general_facilities.mortuary', icon: '🏛️', category: 'Infrastructure' },
    'cafeteria': { label: 'In-house Cafeteria', path: 'general_facilities.cafeteria', icon: '☕', category: 'Infrastructure' },
    'waiting_lounge': { label: 'Patient Waiting Lounge', path: 'general_facilities.waiting_lounge', icon: '🛋️', category: 'Infrastructure' },

    // COMMERCIAL & COMPLIANCE
    'cghs_rates': { label: 'CGHS Rate Acceptance', path: 'cghs_rates_acceptable', icon: '💰', category: 'Commercial', isEnum: true, expectedValue: 'Yes' },
    'tariff_attached': { label: 'Tariff List Attached', path: 'tariff_attached', icon: '📄', category: 'Commercial' },
    'msme': { label: 'MSME Certified', path: 'msme_status', icon: '🏢', category: 'Commercial', isEnum: true, expectedValue: 'Yes' },
    'it_exemption': { label: 'IT Exemption Cert', path: 'it_exemption', icon: '📉', category: 'Commercial', isEnum: true, expectedValue: 'Yes' },
    'no_blacklisting': { label: 'Non-Blacklisted Decl.', path: 'declaration_no_blacklisting', icon: '✅', category: 'Compliance' },
};

module.exports = CRITERIA_REGISTRY;
