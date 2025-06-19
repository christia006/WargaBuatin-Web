// backend/routes/reports.js

const express = require('express');
const router = express.Router();
const reportsModel = require('../models/reports');

// ✅ GET all reports
// @route   GET /api/reports
// @desc    Ambil semua laporan
router.get('/reports', async (req, res) => {
  try {
    const reports = await reportsModel.findAll();
    res.json(reports);
  } catch (err) {
    console.error('❌ Error saat mengambil laporan:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data laporan' });
  }
});

// ✅ GET report by ID
// @route   GET /api/reports/:id
// @desc    Ambil laporan berdasarkan ID
router.get('/reports/:id', async (req, res) => {
  try {
    const report = await reportsModel.findById(req.params.id);
    if (report) {
      res.json(report);
    } else {
      res.status(404).json({ error: 'Laporan tidak ditemukan' });
    }
  } catch (err) {
    console.error('❌ Error saat mengambil laporan by ID:', err.message);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil laporan' });
  }
});

// ✅ POST new report
// @route   POST /api/reports
// @desc    Tambah laporan baru
router.post('/reports', async (req, res) => {
  try {
    const { reporter_name, location, damage_type, description, incident_date } = req.body;
    const newReport = await reportsModel.create({
      reporter_name,
      location,
      damage_type,
      description,
      incident_date,
    });
    res.status(201).json(newReport);
  } catch (err) {
    console.error('❌ Error saat membuat laporan:', err.message);
    res.status(500).json({ error: 'Gagal membuat laporan baru' });
  }
});

// ✅ PUT update report
// @route   PUT /api/reports/:id
// @desc    Perbarui laporan
router.put('/reports/:id', async (req, res) => {
  try {
    const { reporter_name, location, damage_type, description, incident_date } = req.body;
    const updated = await reportsModel.update(req.params.id, {
      reporter_name,
      location,
      damage_type,
      description,
      incident_date,
    });

    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Laporan tidak ditemukan' });
    }
  } catch (err) {
    console.error('❌ Error saat memperbarui laporan:', err.message);
    res.status(500).json({ error: 'Gagal memperbarui laporan' });
  }
});

// ✅ DELETE report
// @route   DELETE /api/reports/:id
// @desc    Hapus laporan
router.delete('/reports/:id', async (req, res) => {
  try {
    const deleted = await reportsModel.delete(req.params.id);
    if (deleted) {
      res.json({ message: 'Laporan berhasil dihapus' });
    } else {
      res.status(404).json({ error: 'Laporan tidak ditemukan' });
    }
  } catch (err) {
    console.error('❌ Error saat menghapus laporan:', err.message);
    res.status(500).json({ error: 'Gagal menghapus laporan' });
  }
});

module.exports = router;
