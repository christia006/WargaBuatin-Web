// backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Middleware verifikasi token JWT
const { pool } = require('../config/db');   // Koneksi ke PostgreSQL

// @route   GET /api/admin/dashboard-stats
// @desc    Mendapatkan statistik untuk halaman dashboard admin
// @access  Private (Admin Only)
router.get('/dashboard-stats', auth, async (req, res) => {
    // Cek apakah user login dan memiliki role admin
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Akses ditolak: Anda tidak memiliki hak administrator.' });
    }

    let client;
    try {
        client = await pool.connect();

        // Jalankan semua query statistik secara paralel
        const [
            totalUsersResult,
            totalEventsResult,
            totalReportsResult,
            totalPartnersResult,
            totalVolunteersResult,
            totalLocationsResult
        ] = await Promise.all([
            client.query('SELECT COUNT(*) FROM users'),
            client.query('SELECT COUNT(*) FROM events'),
            client.query('SELECT COUNT(*) FROM reports'),
            client.query('SELECT COUNT(*) FROM bank_sampah_partners'),
            client.query('SELECT COUNT(*) FROM daftarrelawan'),
            client.query('SELECT COUNT(*) FROM locations')
        ]);

        // Kirim response JSON
        res.json({
            totalUsers: parseInt(totalUsersResult.rows[0].count),
            totalEvents: parseInt(totalEventsResult.rows[0].count),
            totalReports: parseInt(totalReportsResult.rows[0].count),
            totalPartners: parseInt(totalPartnersResult.rows[0].count),
            totalVolunteers: parseInt(totalVolunteersResult.rows[0].count),
            totalLocations: parseInt(totalLocationsResult.rows[0].count)
        });

    } catch (err) {
        console.error('❌ Gagal mengambil statistik dashboard:', err.message);
        res.status(500).json({ message: 'Server error saat mengambil statistik dashboard.' });
    } finally {
        if (client) client.release();
    }
});

module.exports = router;
