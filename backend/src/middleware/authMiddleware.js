const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    console.log('[DEBUG] verifyToken called. Type of next:', typeof next);
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        console.log('[DEBUG] Token verified for user:', req.userId);
        if (typeof next !== 'function') {
            console.error('[ERROR] next is not a function in verifyToken!');
        }
        next();
    });
};

exports.isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Require Admin Role' });
    next();
};

exports.isDeliveryPartner = (req, res, next) => {
    if (req.userRole !== 'delivery' && req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Require Delivery or Admin Role' });
    }
    next();
};
