const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const streamifier = require('streamifier');
const zlib = require('zlib');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Helper to convert stream to buffer
const streamToBuffer = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
};

// GET /api/admin/db/backup — Admin: Download full JSON backup of hospitals + attachments
router.get('/db/backup', auth, async (req, res) => {
    try {
        console.log('⏳ Starting full system backup (Metadata + Binaries)...');
        const hospitals = await Hospital.find().lean();
        
        // Fetch GridFS Files
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
        const filesMetadata = await mongoose.connection.db.collection('uploads.files').find().toArray();
        
        const backupFiles = [];
        for (const fileDoc of filesMetadata) {
            try {
                const buffer = await streamToBuffer(bucket.openDownloadStream(fileDoc._id));
                backupFiles.push({
                    metadata: fileDoc,
                    data: buffer.toString('base64')
                });
            } catch (fileErr) {
                console.warn(`⚠️ Skipping file ${fileDoc._id} due to read error:`, fileErr.message);
            }
        }

        const backup = {
            version: '2.0', // Incremented version for binary support
            timestamp: new Date().toISOString(),
            corps: 'HOSPITAL_EMPANELMENT',
            data: {
                hospitals,
                files: backupFiles
            }
        };

        console.log(`✅ Backup complete: ${hospitals.length} hospitals, ${backupFiles.length} files. Starting compression...`);
        
        const backupString = JSON.stringify(backup);
        
        res.setHeader('Content-disposition', `attachment; filename=hospital_vault_backup_${new Date().toISOString().split('T')[0]}.json.gz`);
        res.setHeader('Content-type', 'application/x-gzip');
        res.setHeader('Content-Encoding', 'gzip');

        // Stream compressed data
        const gzip = zlib.createGzip({ level: 9 });
        streamifier.createReadStream(backupString).pipe(gzip).pipe(res);
        
    } catch (err) {
        console.error('❌ Backup Failure:', err);
        // If headers haven't been sent, send error JSON
        if (!res.headersSent) {
            res.status(500).json({ error: 'Backup failed: ' + err.message });
        }
    }
});

// POST /api/admin/db/restore — Admin: Restore from JSON/Gzip backup (Full Fidelity)
router.post('/db/restore', auth, upload.single('backup'), async (req, res) => {
    try {
        let backupData;

        // Extract backup data based on input type (Multer file or Legacy JSON body)
        if (req.file) {
            console.log(`⏳ Received backup file: ${req.file.originalname} (${req.file.size} bytes)`);
            let fileBuffer = req.file.buffer;
            
            // Auto-decompress if it's a GZIP file
            if (req.file.originalname.endsWith('.gz') || req.file.mimetype === 'application/x-gzip') {
                console.log('   - Decompressing Gzip payload...');
                fileBuffer = zlib.gunzipSync(fileBuffer);
            }
            
            backupData = JSON.parse(fileBuffer.toString());
        } else {
            console.log('⏳ Received legacy JSON backup payload');
            backupData = req.body.data || req.body;
        }

        const hospitalsArray = backupData.hospitals;
        const filesArray = backupData.files || [];

        if (!hospitalsArray || !Array.isArray(hospitalsArray)) {
            return res.status(400).json({ error: 'Invalid backup format: No hospitals array found' });
        }

        console.log(`⏳ Starting full restoration: ${hospitalsArray.length} records, ${filesArray.length} attachments...`);

        // 1. Clear Clinical Data
        const deleteHospitals = await Hospital.deleteMany({});
        console.log(`   - Cleared ${deleteHospitals.deletedCount} hospital records.`);
        
        // 2. Clear GridFS Binary Storage
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
        try {
            await bucket.drop();
            console.log('   - Dropped existing uploads bucket.');
        } catch (e) {
            console.log('   - Bucket not found or already empty, proceeding...');
        }

        // 3. Restore Binaries (GridFS)
        console.log('   - Reconstructing binary vault...');
        for (const filePack of filesArray) {
            const { metadata, data } = filePack;
            const fileBuffer = Buffer.from(data, 'base64');
            const uploadStream = bucket.openUploadStreamWithId(
                new mongoose.Types.ObjectId(metadata._id),
                metadata.filename,
                { contentType: metadata.contentType, metadata: metadata.metadata }
            );

            await new Promise((resolve, reject) => {
                streamifier.createReadStream(fileBuffer)
                    .pipe(uploadStream)
                    .on('error', reject)
                    .on('finish', resolve);
            });
        }

        // 4. Restore Hospital Metadata
        const cleanHospitals = hospitalsArray.map(h => {
            const hCopy = { ...h };
            delete hCopy.__v;
            delete hCopy.createdAt;
            delete hCopy.updatedAt;
            if (hCopy._id && typeof hCopy._id === 'string' && hCopy._id.length === 24) {
                hCopy._id = new mongoose.Types.ObjectId(hCopy._id);
            }
            return hCopy;
        });

        const result = await Hospital.collection.insertMany(cleanHospitals);

        console.log(`✅ Restoration Successful: ${result.insertedCount} records and ${filesArray.length} files restored.`);
        res.json({ message: `System restored: ${result.insertedCount} hospitals and ${filesArray.length} attachments recovered.` });
    } catch (err) {
        console.error('❌ Restore Error Detail:', err);
        res.status(500).json({ 
            error: 'Restore failed', 
            details: err.message
        });
    }
});

// DELETE /api/admin/db/clear — Admin: Clear all hospital data (CAUTION)
router.delete('/db/clear', auth, async (req, res) => {
    try {
        const hospitalCount = await Hospital.countDocuments();
        
        // Clear collections
        await Hospital.deleteMany({});
        
        // Also clear GridFS buckets if possible
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads'
        });
        await bucket.drop();

        res.json({ message: `Database cleared. ${hospitalCount} records and all attachments removed.` });
    } catch (err) {
        res.status(500).json({ error: 'Clear failed: ' + err.message });
    }
});

module.exports = router;
