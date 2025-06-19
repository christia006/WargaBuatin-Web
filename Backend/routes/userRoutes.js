// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Pastikan path relatif ini benar

// Rute untuk pendaftaran
router.post('/register', userController.registerUser);

// Rute untuk login - INI YANG PALING PENTING UNTUK DIPERIKSA
router.post('/login', userController.loginUser); // PASTIKAN INI ADA DAN TIDAK DIKOMENTARI

module.exports = router;