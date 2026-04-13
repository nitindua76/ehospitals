const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// GET /api/admin/db/backup — Admin: Download full JSON backup of hospitals
router.get('/db/backup', auth, async (req, res) => {
    try {
        const hospitals = await Hospital.find().lean();
        const backup = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            corps: 'HOSPITAL_EMPANELMENT',
            data: {
                hospitals
            }
        };

        res.setHeader('Content-disposition', 'attachment; filename=hospital_db_backup.json');
        res.setHeader('Content-type', 'application/json');
        res.send(JSON.stringify(backup, null, 2));
    } catch (err) {
        res.status(500).json({ error: 'Backup failed: ' + err.message });
    }
});

// POST /api/admin/db/restore — Admin: Restore from JSON backup
router.post('/db/restore', auth, async (req, res) => {
    try {
        const payload = req.body;
        // Handle both wrapped { data: { hospitals } } and direct { hospitals } formats
        const hospitalsArray = payload.hospitals || payload.data?.hospitals;

        if (!hospitalsArray || !Array.isArray(hospitalsArray)) {
            return res.status(400).json({ error: 'Invalid backup format: No hospitals array found' });
        }

        console.log(`⏳ Starting restore of ${hospitalsArray.length} records...`);

        // Clear and restore
        const deleteResult = await Hospital.deleteMany({});
        console.log(`✅ Cleared ${deleteResult.deletedCount} existing records.`);
        
        // Prepare data for raw insertion (bypassing Mongoose hooks)
        const cleanData = hospitalsArray.map(h => {
            const hCopy = { ...h };
            
            // Remove Mongoose/Internal fields that might conflict
            delete hCopy.__v;
            delete hCopy.createdAt;
            delete hCopy.updatedAt;

            // Ensure _id is a proper ObjectId if it looks like one
            if (hCopy._id && typeof hCopy._id === 'string' && hCopy._id.length === 24) {
                hCopy._id = new mongoose.Types.ObjectId(hCopy._id);
            }

            // Also convert any other ObjectId fields as needed
            // (In a real system, we'd recursively check the schema)
            
            return hCopy;
        });

        // Use direct collection access to bypass Mongoose validation/hooks
        // This is safer for backups that might have slightly stale schema data
        const result = await Hospital.collection.insertMany(cleanData);

        res.json({ message: `Successfully restored ${result.insertedCount} hospital records.` });
    } catch (err) {
        console.error('❌ Restore Error Detail:', err);
        res.status(500).json({ 
            error: 'Restore failed', 
            details: err.message,
            code: err.code === 11000 ? 'DUPLICATE_KEY' : 'INTERNAL'
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
