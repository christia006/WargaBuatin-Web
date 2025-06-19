// backend/routes/partners.js
const express = require('express');
const router = express.Router();
const partnersModel = require('../models/partners'); // Pastikan path ke model benar

// GET all partners
router.get('/', async (req, res) => {
    try {
        const partners = await partnersModel.findAll();
        res.json(partners);
    } catch (err) {
        console.error('Error fetching partners:', err);
        res.status(500).json({ error: 'Gagal mengambil data mitra' });
    }
});

// POST new partner
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, address, message } = req.body;

        // Validasi dasar
        if (!name || !email || !phone) {
            return res.status(400).json({ message: 'Nama, email, dan nomor telepon harus diisi.' });
        }

        const newPartner = await partnersModel.create({ name, email, phone, address, message });
        res.status(201).json(newPartner);
    } catch (err) {
        console.error('Error creating partner:', err);
        // Handle unique email constraint error if necessary
        if (err.code === '23505' && err.constraint === 'bank_sampah_partners_email_key') {
            return res.status(409).json({ message: 'Email ini sudah terdaftar sebagai mitra.' });
        }
        res.status(500).json({ error: 'Gagal mendaftarkan mitra baru' });
    }
});

// GET partner by ID (opsional, jika diperlukan)
router.get('/:id', async (req, res) => {
    try {
        const partner = await partnersModel.findById(req.params.id);
        if (partner) {
            res.json(partner);
        } else {
            res.status(404).json({ error: 'Mitra tidak ditemukan' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data mitra' });
    }
});

// PUT update partner (opsional, jika diperlukan)
router.put('/:id', async (req, res) => {
    try {
        const { name, email, phone, address, message } = req.body;
        const updatedPartner = await partnersModel.update(req.params.id, { name, email, phone, address, message });
        if (updatedPartner) {
            res.json(updatedPartner);
        } else {
            res.status(404).json({ error: 'Mitra tidak ditemukan' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal memperbarui data mitra' });
    }
});

// DELETE partner (opsional, jika diperlukan)
router.delete('/:id', async (req, res) => {
    try {
        const deletedPartner = await partnersModel.delete(req.params.id);
        if (deletedPartner) {
            res.json({ message: 'Mitra berhasil dihapus' });
        } else {
            res.status(404).json({ error: 'Mitra tidak ditemukan' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal menghapus mitra' });
    }
});

module.exports = router;