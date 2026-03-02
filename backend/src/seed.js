require('dotenv').config();
const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
const Admin = require('./models/Admin');
const ScoringConfig = require('./models/ScoringConfig');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_selection';

const hospitals = [
    {
        name: 'Apollo Main Hospital Chennai',
        username: 'apollo_chennai',
        password: 'Apollo@1234',
        brand_name: 'Apollo Hospitals Group',
        pan_number: 'AAACA1234F',
        pan_attached: true,
        gst_number: '33AAACA1234F1Z5',
        gst_attached: true,
        msme_status: 'No',
        type: 'Multi-Specialty',
        address: '21, Greams Lane, Off Greams Road, Chennai - 600006',
        city: 'Chennai',
        state: 'Tamil Nadu',
        contact_phone: '044-28293333',
        contact_email: 'admin@apollo.com',
        nodal_contacts: [
            { purpose: 'Admission', name: 'Dr. Ramesh R.', designation: 'Head Admissions', mobile: '9840012345', email: 'admission@apollo.com' },
            { purpose: 'Emergency', name: 'Ms. Priya S.', designation: 'ER Coordinator', mobile: '9840054321', email: 'er@apollo.com' }
        ],
        accreditations: { nabh: true, jci: true, nabl: true, not_accredited: false },
        accreditation_valid_until: new Date('2027-12-31'),
        accreditation_attached: true,
        statutory_clearances: { fire_safety: true, biomedical_waste: true, aerb_approval: true, pharmacy_license: true, lift_safety: true, cea_registration: true },
        specialties: ['Cardiology', 'Neurology', 'Oncology', 'Orthopaedics', 'Vascular surgery'],
        core_specialties: ['General medicine', 'General surgery', 'Anaesthesiology'],
        super_specialties: ['Cardiology', 'Medical oncology', 'Neurosurgery'],
        facilities: { advanced_trauma: true, blood_bank: true, dialysis: true, organ_transplant: true, emergency: true, ventilator: true, nicu: true, picu: true, central_oxygen: true },
        ambulance_facility: 'Yes',
        diagnostic_facilities: { ct: 'Yes', mri: 'Yes', pet_ct: 'Yes' },
        capacity: { general: 300, semi_private: 150, private: 100, icu: 120, hdu: 40 },
        total_beds: 710,
        tariffs_attached: true,
        pathology_lab: 'Yes',
        pharmacy_24x7: 'Yes',
        trauma_support_24x7: 'Yes',
        corporate_help_desk: 'Yes',
        cghs_rates_acceptable: 'No',
        ongc_discount_percent: 15,
        hospital_age: 40,
        ongc_association_years: 10,
        ongc_patient_count: { fy_23_24: 120, fy_24_25: 145, period_25: 45 },
        consultants: [
            { name: 'Dr. Subramanian', specialty: 'Cardiology', type: 'Full time', qualification: 'MD, DM', experience_years: 25, mobile: '9840111222' },
            { name: 'Dr. Lakshmi', specialty: 'Oncology', type: 'Full time', qualification: 'MBBS, MS, MCh', experience_years: 18, mobile: '9840333444' }
        ],
        paramedical_staff_count: 450,
        support_staff_count: 800,
        patient_feedbacks_attached: true,
        general_facilities: { parking: true, power_backup: true, central_ac: true, waiting_lounge: true, cafeteria: true },
        declaration_no_blacklisting: true,
        achievements: 'Best Hospital in India 2024 - Medical Times'
    },
    {
        name: 'AIIMS New Delhi',
        username: 'aiims_delhi',
        password: 'AIIMS@1234',
        brand_name: 'AIIMS',
        pan_number: 'DELH0001G',
        pan_attached: true,
        msme_status: 'No',
        type: 'Multi-Specialty',
        address: 'Ansari Nagar, East, New Delhi - 110029',
        city: 'New Delhi',
        state: 'Delhi',
        contact_phone: '011-26588500',
        contact_email: 'director@aiims.edu',
        specialties: ['Cardiology', 'Neurology', 'Paediatrics', 'Nephrology', 'Critical care medicine'],
        accreditations: { nabh: true, nabl: true, jci: false, not_accredited: false },
        accreditation_valid_until: new Date('2028-01-01'),
        statutory_clearances: { fire_safety: true, biomedical_waste: true, aerb_approval: true, pharmacy_license: true, lift_safety: true, cea_registration: true },
        facilities: { advanced_trauma: true, blood_bank: true, dialysis: true, emergency: true, ventilator: true, nicu: true, picu: true, central_oxygen: true },
        ambulance_facility: 'Yes',
        diagnostic_facilities: { ct: 'Yes', mri: 'Yes', pet_ct: 'Yes' },
        total_beds: 2478,
        pathology_lab: 'Yes',
        pharmacy_24x7: 'Yes',
        cghs_rates_acceptable: 'Yes',
        hospital_age: 68,
        ongc_patient_count: { fy_23_24: 500, fy_24_25: 600, period_25: 150 },
        paramedical_staff_count: 2800,
        support_staff_count: 5000,
        patient_feedbacks_attached: true,
        general_facilities: { parking: true, power_backup: true, central_ac: true, waiting_lounge: true },
        declaration_no_blacklisting: true
    },
    {
        name: 'Medanta The Medicity',
        username: 'medanta_gurugram',
        password: 'Medanta@1234',
        brand_name: 'Medanta',
        pan_number: 'GURG1234M',
        msme_status: 'No',
        type: 'Multi-Specialty',
        address: 'Sector 38, Gurugram, Haryana - 122001',
        city: 'Gurugram',
        state: 'Haryana',
        contact_phone: '0124-4411441',
        contact_email: 'info@medanta.org',
        specialties: ['Cardiac anaesthesia', 'Liver Transplant', 'Medical oncology', 'Neurosurgery'],
        accreditations: { nabh: true, jci: true, nabl: true, not_accredited: false },
        facilities: { advanced_trauma: true, blood_bank: true, dialysis: true, organ_transplant: true, emergency: true, ventilator: true },
        total_beds: 1250,
        pathology_lab: 'Yes',
        pharmacy_24x7: 'Yes',
        cghs_rates_acceptable: 'No',
        ongc_discount_percent: 20,
        hospital_age: 15,
        ongc_patient_count: { fy_23_24: 80, fy_24_25: 95, period_25: 30 },
        paramedical_staff_count: 1400,
        support_staff_count: 2800,
        declaration_no_blacklisting: true
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // ── Non-destructive seeding: only seed if collections are EMPTY ──
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            const admin = new Admin({
                username: process.env.ADMIN_USERNAME || 'admin',
                password: process.env.ADMIN_PASSWORD || 'Admin@123',
            });
            await admin.save();
            await ScoringConfig.create({ name: 'default' });
            console.log(`✅ Admin created: ${admin.username}`);
        } else {
            console.log(`ℹ️  Admin already exists, skipping admin seed`);
        }

        const hospitalCount = await Hospital.countDocuments();
        if (hospitalCount === 0) {
            // Save one by one so the pre-save password hash runs
            for (const h of hospitals) {
                const hosp = new Hospital({ ...h, status: 'pending' });
                await hosp.save();
                console.log(`  ✅ Hospital: ${hosp.name} (login: ${h.username})`);
            }
            console.log(`✅ Inserted ${hospitals.length} hospitals`);
        } else {
            console.log(`ℹ️  ${hospitalCount} hospitals already exist, skipping hospital seed`);
        }

        await mongoose.disconnect();
        console.log('\n🎉 Seed complete!');
    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    }
}

seed();
