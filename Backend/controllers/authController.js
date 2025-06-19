// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const User = require('../models/User'); // Pastikan path ini benar

// ⭐ Pastikan ini mengambil secret dari .env ⭐
// Anda perlu memastikan dotenv dimuat di file entry point server Anda (misal: server.js)
// Contoh: require('dotenv').config(); di bagian atas server.js
const jwtSecret = process.env.JWT_SECRET; 

// Handles user registration
exports.register = async (req, res) => {
    const { username, password, daerah, umur, pertanyaan_keamanan, jawaban_keamanan, role } = req.body;

    if (!username || !password || !daerah || !umur || !pertanyaan_keamanan || !jawaban_keamanan) {
        return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    let client;
    try {
        client = await pool.connect();

        const userExists = await client.query('SELECT id FROM users WHERE username = $1', [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Username sudah terdaftar.' });
        }

        // ⭐ Penting: Fungsi User.create() di models/User.js HARUS menghash password dan jawaban_keamanan ⭐
        const newUser = await User.create(username, password, daerah, umur, pertanyaan_keamanan, jawaban_keamanan, role);

        const payload = {
            user: {
                id: newUser.id,
                username: newUser.username,
                daerah: newUser.daerah,
                umur: newUser.umur,
                role: newUser.role // SERTAKAN ROLE DI PAYLOAD JWT
            }
        };

        jwt.sign(
            payload,
            jwtSecret, // Gunakan jwtSecret yang sudah didefinisikan
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    message: 'Registrasi berhasil!',
                    token,
                    user: {
                        username: newUser.username,
                        daerah: newUser.daerah,
                        umur: newUser.umur,
                        role: newUser.role // KEMBALIKAN ROLE KE FRONTEND
                    }
                });
            }
        );

    } catch (err) {
        console.error('Error during registration:', err.message);
        if (err.message === 'Username sudah digunakan. Silakan pilih yang lain.') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error.' });
    } finally {
        if (client) {
            client.release();
        }
    }
};

// Handles user login
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password diperlukan.' });
    }

    let client;
    try {
        client = await pool.connect();

        const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        const user = result.rows[0];

        // ⭐ PENTING: Pastikan ini membandingkan password yang di-hash dengan benar ⭐
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        const payload = {
            user: {
                id: user.id,
                username: user.username,
                daerah: user.daerah,
                umur: user.umur,
                role: user.role // PASTIKAN ROLE DISERTKAN DI SINI
            }
        };

        jwt.sign(
            payload,
            jwtSecret, // Gunakan jwtSecret yang sudah didefinisikan
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    message: 'Login berhasil!',
                    token,
                    user: {
                        username: user.username,
                        daerah: user.daerah,
                        umur: user.umur,
                        role: user.role // PASTIKAN ROLE JUGA DIKEMBALIKAN DI SINI
                    }
                });
            }
        );

    } catch (err) {
        console.error('Error during login:', err.message);
        res.status(500).json({ message: 'Server error.' });
    } finally {
        if (client) {
            client.release();
        }
    }
};
