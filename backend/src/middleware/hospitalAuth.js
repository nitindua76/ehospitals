const jwt = require('jsonwebtoken');

// Middleware: validates a hospital JWT token (role must be 'hospital')
module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        console.log(`🔒 hospitalAuth: Verifying token...`);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'hospital') {
            console.error(`🔒 hospitalAuth: Access denied - role is ${decoded.role}`);
            return res.status(403).json({ error: 'Access denied: not a hospital token' });
        }
        req.hospital = decoded;
        console.log(`🔒 hospitalAuth: Token verified for hospital ${decoded.id}`);
        next();
    } catch (err) {
        console.error(`🔒 hospitalAuth: Token verification failed: ${err.message}`);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
