const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/hospital_selection';

async function verify() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected.');

        const db = mongoose.connection.db;
        const filesCollection = db.collection('uploads.files');
        const count = await filesCollection.countDocuments();

        console.log(`\n📊 Total files in GridFS: ${count}`);

        if (count > 0) {
            console.log('\n📄 Last 5 uploads:');
            const files = await filesCollection.find().sort({ uploadDate: -1 }).limit(5).toArray();
            files.forEach(f => {
                console.log(`- Name: ${f.filename}`);
                console.log(`  Type: ${f.metadata?.type || 'N/A'}`);
                console.log(`  Size: ${(f.length / 1024).toFixed(2)} KB`);
                console.log(`  Date: ${f.uploadDate}`);
                console.log('  ---');
            });
        } else {
            console.log('❌ No files found in the uploads bucket.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error during verification:', err.message);
        process.exit(1);
    }
}

verify();
