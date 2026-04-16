const mongoose = require('mongoose');

async function check() {
    await mongoose.connect('mongodb://localhost:27017/hospital_selection');
    const db = mongoose.connection.db;
    const docs = await db.collection('hospitals').find({}).toArray();
    for (let doc of docs) {
        console.log(`Hospital: ${doc.name} (${doc._id})`);
        console.log(`  schedule_of_charges_attached: ${doc.schedule_of_charges_attached} (type: ${typeof doc.schedule_of_charges_attached})`);
        if (doc.bank_details) {
            console.log(`  bank_details.ecs_mandate_attached: ${doc.bank_details.ecs_mandate_attached} (type: ${typeof doc.bank_details.ecs_mandate_attached})`);
        }
    }
    process.exit(0);
}

check();
