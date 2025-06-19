// backend/controllers/adminController.js
<<<<<<< HEAD
const { pool } = require('../config/db'); // Import pool untuk query langsung jika perlu
const User = require('../models/User'); // Import model User

// @route   GET api/admin/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const users = await User.findAll(); // Gunakan metode findAll dari model User
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err.message);
        res.status(500).json({ msg: 'Server Error: Gagal mengambil daftar pengguna.' });
    } finally {
        if (client) {
            client.release();
        }
    }
};

// @route   GET api/admin/dashboard-stats
=======
const { pool } = require('../config/db'); // PostgreSQL connection pool
const User = require('../models/User');   // Sequelize model jika Anda menggunakan Sequelize

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        // Pastikan hanya admin yang bisa mengakses (validasi sebaiknya di middleware)
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Akses ditolak: Anda bukan admin.' });
        }

        // Menggunakan Sequelize (jika Anda memakai ORM)
        const users = await User.findAll({
            attributes: { exclude: ['password'] }, // Jangan tampilkan password
            order: [['createdAt', 'DESC']]
        });

        res.json(users);
    } catch (err) {
        console.error('❌ Gagal mengambil daftar pengguna:', err.message);
        res.status(500).json({ message: 'Server error: gagal mengambil daftar pengguna.' });
    }
};

// @route   GET /api/admin/dashboard-stats
>>>>>>> 0fd2cf3d78aabc2c3e2d8ac6c4b46e39706d7371
// @desc    Get dashboard statistics (Admin only)
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
    let client;
    try {
<<<<<<< HEAD
        client = await pool.connect();
        const totalUsersResult = await client.query('SELECT COUNT(*) FROM users');
        const totalUsers = parseInt(totalUsersResult.rows[0].count);

        // Contoh: Mengambil jumlah events
        const totalEventsResult = await client.query('SELECT COUNT(*) FROM events');
        const totalEvents = parseInt(totalEventsResult.rows[0].count);

        // Contoh: Mengambil jumlah reports
        const totalReportsResult = await client.query('SELECT COUNT(*) FROM reports');
        const totalReports = parseInt(totalReportsResult.rows[0].count);

        res.json({
            totalUsers,
            totalEvents,
            totalReports
            // Anda bisa menambahkan statistik lain di sini
        });
    } catch (err) {
        console.error('Error fetching dashboard stats:', err.message);
        res.status(500).json({ msg: 'Server Error: Gagal mengambil statistik dashboard.' });
    } finally {
        if (client) {
            client.release();
        }
    }
};
=======
        // Validasi role admin
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Akses ditolak: Anda bukan admin.' });
        }

        client = await pool.connect();

        // Query paralel untuk efisiensi
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
};
>>>>>>> 0fd2cf3d78aabc2c3e2d8ac6c4b46e39706d7371
