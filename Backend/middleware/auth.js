// backend/middleware/auth.js

const jwt = require('jsonwebtoken');
// ⭐ Jika Anda menggunakan 'config' npm package, gunakan ini: ⭐
// const config = require('config');
// const jwtSecret = config.get('jwtSecret');

// ⭐ Jika Anda mengambil dari process.env (lebih umum dengan dotenv), gunakan ini: ⭐
const jwtSecret = process.env.JWT_SECRET; // Pastikan JWT_SECRET ada di backend/.env

module.exports = function (req, res, next) {
    // Dapatkan token dari header
    const token = req.header('x-auth-token');

    // ⭐ TAMBAHKAN LOGIKA UNTUK "MAGIC ADMIN TOKEN" ⭐
    if (token === 'AdminWargaBuatin') {
        console.log('Magic Admin Token detected. Granting admin access for development.');
        req.user = {
            id: 'magic_admin_id', // ID dummy untuk keperluan development
            username: 'WargaBuatin Admin',
            role: 'admin'
        };
        return next();
    }

    // Cek apakah ada token
    if (!token) {
        return res.status(401).json({ message: 'Tidak ada token, otorisasi ditolak.' });
    }

    // Verifikasi token
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded.user; // Menetapkan objek user yang didekode ke request
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(401).json({ message: 'Token tidak valid.' });
    }
};