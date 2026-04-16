const mongoose = require('mongoose');

async function fix() {
    await mongoose.connect('mongodb://localhost:27017/hospital_selection');
    const db = mongoose.connection.db;
    
    const result = await db.collection('hospitals').updateMany(
        { 
            $or: [
                { schedule_of_charges_attached: "false" },
                { schedule_of_charges_attached: false },
                { schedule_of_charges_attached: "true" },
                { schedule_of_charges_attached: true }
            ] 
        },
        { 
            $unset: { schedule_of_charges_attached: "" }
        }
    );
    console.log(`Updated ${result.modifiedCount} documents for schedule_of_charges_attached.`);

    const result2 = await db.collection('hospitals').updateMany(
        { 
            $or: [
                { "bank_details.ecs_mandate_attached": "false" },
                { "bank_details.ecs_mandate_attached": false },
                { "bank_details.ecs_mandate_attached": "true" },
                { "bank_details.ecs_mandate_attached": true }
            ] 
        },
        { 
            $unset: { "bank_details.ecs_mandate_attached": "" }
        }
    );
    console.log(`Updated ${result2.modifiedCount} documents for ecs_mandate_attached.`);

    process.exit(0);
}

fix();
