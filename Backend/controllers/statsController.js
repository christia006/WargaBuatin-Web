// backend/controllers/statsController.js
const { pool } = require('../config/db');

/**
 * @desc Get counts of records from various tables
 * @route GET /api/counts
 * @access Public
 */
const getCounts = async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Fetch count for events
    const eventResult = await client.query('SELECT COUNT(*) FROM events');
    const eventCount = parseInt(eventResult.rows[0].count);

    // Fetch count for bank_sampah_partners
    const bankSampahResult = await client.query('SELECT COUNT(*) FROM bank_sampah_partners');
    const bankSampahCount = parseInt(bankSampahResult.rows[0].count);

    // Fetch count for daftarrelawan
    const relawanResult = await client.query('SELECT COUNT(*) FROM daftarrelawan');
    const relawanCount = parseInt(relawanResult.rows[0].count);

    // Fetch count for reports
    const reportResult = await client.query('SELECT COUNT(*) FROM reports');
    const reportCount = parseInt(reportResult.rows[0].count);

    client.release();

    res.json({
      eventCount,
      bankSampahCount,
      relawanCount,
      reportCount,
    });
  } catch (error) {
    console.error('Error fetching counts:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getCounts,
};
