// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // If you use this
const { pool } = require('../config/db'); // Assuming you fetch user from DB

const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Fetch user from DB or attach decoded user info to req
            const userResult = await pool.query('SELECT id, username, email, role FROM users WHERE id = $1', [decoded.id]);
            if (userResult.rows.length === 0) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }
            req.user = userResult.rows[0]; // Attach user to request
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
});

module.exports = { protect };