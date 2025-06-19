// backend/models/partners.js
const { pool } = require('../config/db'); // Pastikan path ini benar

const partnersModel = {
    // Mengambil semua data mitra
    async findAll() {
        try {
            const result = await pool.query('SELECT * FROM bank_sampah_partners ORDER BY created_at DESC');
            return result.rows;
        } catch (error) {
            console.error('Error in partnersModel.findAll:', error);
            throw error;
        }
    },

    // Membuat mitra baru
    async create({ name, email, phone, address, message }) {
        try {
            const result = await pool.query(
                'INSERT INTO bank_sampah_partners (name, email, phone, address, message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [name, email, phone, address, message]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error in partnersModel.create:', error);
            throw error;
        }
    },

    // Mencari mitra berdasarkan ID
    async findById(id) {
        try {
            const result = await pool.query('SELECT * FROM bank_sampah_partners WHERE id = $1', [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error in partnersModel.findById:', error);
            throw error;
        }
    },

    // Memperbarui data mitra
    async update(id, { name, email, phone, address, message }) {
        try {
            const result = await pool.query(
                'UPDATE bank_sampah_partners SET name = $1, email = $2, phone = $3, address = $4, message = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
                [name, email, phone, address, message, id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error in partnersModel.update:', error);
            throw error;
        }
    },

    // Menghapus mitra
    async delete(id) {
        try {
            const result = await pool.query('DELETE FROM bank_sampah_partners WHERE id = $1 RETURNING *', [id]);
            return result.rows[0]; // Mengembalikan data yang dihapus jika ditemukan
        } catch (error) {
            console.error('Error in partnersModel.delete:', error);
            throw error;
        }
    }
};

module.exports = partnersModel;