const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authorization = req.get('Authorization');
    const match = typeof authorization === 'string' && /^Bearer ([^\s]+)$/i.exec(authorization);
    if (!match) {
        return res.status(401).json({ message: 'A Bearer token is required' });
    }
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'Authentication is not configured' });
    }

    try {
        req.user = jwt.verify(match[1], process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return next();
};

module.exports = authMiddleware;
