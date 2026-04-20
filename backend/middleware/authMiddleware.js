const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log("AUTH HEADER:", req.headers['authorization']);
    console.log("TOKEN:", token);

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log("JWT ERROR:", err.message);
            return res.status(403).json({ error: 'Invalid token.' });
        }
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
console.log("JWT_SECRET:", process.env.JWT_SECRET);