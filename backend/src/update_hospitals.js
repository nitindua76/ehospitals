require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_selection';
const DB_NAME = 'hospital_selection';

async function migrate() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        console.log('Connected to MongoDB Native Driver for migration');
        const db = client.db(DB_NAME);
        const collection = db.collection('hospitals');

        const hospitals = await collection.find({}).toArray();
        console.log(`Found ${hospitals.length} hospitals to update.`);

        const sectors = ['Government', 'Private', 'Trust', 'Corporate'];

        for (let i = 0; i < hospitals.length; i++) {
            const h = hospitals[i];
            const updates = {};

            // 1. Ownership Type Fix
            if (!h.ownership_type) {
                if (h.name.toLowerCase().includes('aiims') || h.name.toLowerCase().includes('government')) {
                    updates.ownership_type = 'Government';
                } else {
                    updates.ownership_type = sectors[i % sectors.length];
                }
            }

            // 2. Ensure Capacity Distribution (for bed mix chart)
            if (!h.capacity || !h.capacity.general) {
                updates.capacity = {
                    general: Math.floor((h.total_beds || 100) * 0.6),
                    semi_private: Math.floor((h.total_beds || 100) * 0.2),
                    private: Math.floor((h.total_beds || 100) * 0.1),
                    icu: Math.floor((h.total_beds || 100) * 0.1),
                    hdu: Math.floor((h.total_beds || 100) * 0.05),
                };
            }

            // 3. Ensure ONGC/CGHS data for commercial chart
            if (h.cghs_rates_acceptable === undefined || h.cghs_rates_acceptable === null) {
                updates.cghs_rates_acceptable = i % 2 === 0 ? 'Yes' : 'No';
            }
            if (h.ongc_discount_percent === undefined || h.ongc_discount_percent === null) {
                updates.ongc_discount_percent = 10 + (i % 3) * 5;
            }

            // 4. Ensure Consultant/Specialty data
            if (!h.consultants || h.consultants.length === 0) {
                updates.consultants = [
                    { name: `Dr. ${h.name.split(' ')[0]}`, specialty: h.specialties?.[0] || 'General', type: 'Full time', experience_years: 10 + (i % 5) * 5 }
                ];
            }

            if (Object.keys(updates).length > 0) {
                await collection.updateOne({ _id: h._id }, { $set: updates });
                console.log(`  ✅ Updated Native: ${h.name}`);
            }
        }

        console.log('\n🎉 Native Migration complete!');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.close();
    }
}

migrate();
