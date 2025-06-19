// backend/models/User.js

const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    /**
     * Membuat user baru di database.
     * Password dan jawaban keamanan akan di-hash sebelum disimpan.
     * Ditambahkan parameter `role`.
     * @param {string} username
     * @param {string} password
     * @param {string} daerah
     * @param {number} umur
     * @param {string} pertanyaanKeamanan
     * @param {string} jawabanKeamanan
     * @param {string} [role='user']
     * @returns {Promise<Object>} Objek user yang baru dibuat
     */
    static async create(username, password, daerah, umur, pertanyaanKeamanan, jawabanKeamanan, role = 'user') {
        let client; // Deklarasikan client di luar try block
        try {
            client = await pool.connect(); // Dapatkan koneksi dari pool

            const hashedPassword = await bcrypt.hash(password, 10);
            const hashedJawabanKeamanan = await bcrypt.hash(jawabanKeamanan, 10);

            const query = `
                INSERT INTO users (username, password, daerah, umur, pertanyaan_keamanan, jawaban_keamanan, role)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, username, daerah, umur, pertanyaan_keamanan, role, created_at
            `;
            const values = [username, hashedPassword, daerah, umur, pertanyaanKeamanan, hashedJawabanKeamanan, role];

            const result = await client.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error saat membuat user baru:', error);
            if (error.code === '23505') { // PostgreSQL unique violation error code
                throw new Error('Username sudah digunakan. Silakan pilih yang lain.');
            }
            throw new Error('Gagal membuat user baru.');
        } finally {
            if (client) {
                client.release(); // Pastikan koneksi dilepaskan kembali ke pool
            }
        }
    }

    /**
     * Mencari user berdasarkan username.
     * Mengembalikan objek user jika ditemukan, atau undefined jika tidak.
     * @param {string} username
     * @returns {Promise<Object|undefined>} Objek user atau undefined
     */
    static async findByUsername(username) {
        let client;
        try {
            client = await pool.connect();
            const query = 'SELECT * FROM users WHERE username = $1';
            const result = await client.query(query, [username]);
            return result.rows[0];
        } catch (error) {
            console.error('Error saat mencari user berdasarkan username:', error);
            throw new Error('Gagal mencari user.');
        } finally {
            if (client) {
                client.release();
            }
        }
    }

    /**
     * Mengambil semua pengguna dari database (untuk admin).
     * @returns {Promise<Array<Object>>} Daftar semua user
     */
    static async findAll() {
        let client;
        try {
            client = await pool.connect();
            const query = 'SELECT id, username, daerah, umur, role, created_at FROM users ORDER BY created_at DESC';
            const result = await client.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error saat mengambil semua pengguna:', error);
            throw new Error('Gagal mengambil daftar pengguna.');
        } finally {
            if (client) {
                client.release();
            }
        }
    }

    /**
     * Membandingkan password yang diberikan (plain text) dengan hashed password dari database.
     * Mengembalikan true jika cocok, false jika tidak.
     * @param {string} candidatePassword
     * @param {string} hashedPassword
     * @returns {Promise<boolean>} True jika cocok, false jika tidak
     */
    static async comparePassword(candidatePassword, hashedPassword) {
        try {
            return await bcrypt.compare(candidatePassword, hashedPassword);
        } catch (error) {
            console.error('Error saat membandingkan password:', error);
            throw new Error('Gagal memverifikasi password.');
        }
    }
}

module.exports = User;
