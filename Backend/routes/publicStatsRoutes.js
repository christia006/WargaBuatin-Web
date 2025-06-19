const express = require('express');
const router = express.Router();
const { pool } = require('../config/db'); // Untuk query database

// @route   GET /api/public-stats/counts
// @desc    Get public dashboard statistics (Event, Bank Sampah, Relawan, Laporan)
// @access  Public
router.get('/counts', async (req, res) => {
    let client;
    try {
        client = await pool.connect();

        // Ambil total events
        const eventCountResult = await client.query('SELECT COUNT(*) FROM events');
        const eventCount = parseInt(eventCountResult.rows[0].count);

        // Ambil total partners (Bank Sampah)
        const bankSampahCountResult = await client.query('SELECT COUNT(*) FROM bank_sampah_partners');
        const bankSampahCount = parseInt(bankSampahCountResult.rows[0].count);

        // Ambil total volunteers (Relawan)
        const relawanCountResult = await client.query('SELECT COUNT(*) FROM daftarrelawan');
        const relawanCount = parseInt(relawanCountResult.rows[0].count);

        // Ambil total reports (Laporan Lingkungan)
        const reportCountResult = await client.query('SELECT COUNT(*) FROM reports');
        const reportCount = parseInt(reportCountResult.rows[0].count);

        res.json({
            eventCount,
            bankSampahCount,
            relawanCount,
            reportCount
        });

    } catch (err) {
        console.error('Error fetching public stats:', err.message);
        res.status(500).json({ message: 'Server error saat mengambil statistik publik.' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

module.exports = router;