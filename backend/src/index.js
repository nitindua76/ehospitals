require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_selection';

// Security & Middleware
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        const allowed = [
            'http://localhost:3000', 'http://localhost:3001',
            'http://hospital-portal:80', 'http://admin-dashboard:80',
            // 🔐 PRODUCTION: Replace with your actual domains, e.g. 'https://yourdomain.com'
        ];
        // Allow requests with no origin (same-origin / server-to-server) only in dev
        if (!origin || allowed.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// General limiter
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use(limiter);

// Strict limiter for login endpoint — max 10 attempts per 15 min per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Routes
app.use('/api/auth/login', loginLimiter);        // Strict login rate limit
app.use('/api/auth', require('./routes/auth'));           // Admin auth
app.use('/api/hospital-auth', require('./routes/hospitalAuth')); // Hospital auth
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/scoring', require('./routes/scoring'));
app.use('/api/export', require('./routes/export'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server immediately (required for Render health checks)
app.listen(PORT, () => {
    console.log(`🚀 Hospital Selection API running on port ${PORT}`);
});

// Connect to MongoDB in the background
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB connected');

        // Auto-seed if DB is empty
        const Admin = require('./models/Admin');
        const ScoringConfig = require('./models/ScoringConfig');
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            console.log('⚙️  No admin found, running auto-seed...');
            try {
                const { execSync } = require('child_process');
                execSync('node src/seed.js', { stdio: 'inherit' });
            } catch (e) {
                console.log('⚠️ Seeding failed, creating default admin...');
                await Admin.create({
                    username: process.env.ADMIN_USERNAME || 'admin',
                    password: process.env.ADMIN_PASSWORD || 'Admin@123'
                });
                await ScoringConfig.create({ name: 'default' });
            }
        }
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        // Don't exit process, let the server stay up so we can see logs
    });
