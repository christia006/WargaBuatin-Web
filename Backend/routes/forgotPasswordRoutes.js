// backend/routes/forgotPasswordRoutes.js
const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../controllers/forgotPasswordController');

// Route untuk verifikasi akun (langkah 1)
router.post('/verify-account', forgotPasswordController.verifyAccount);

// Route untuk mereset password (langkah 2)
router.post('/reset-password', forgotPasswordController.resetPassword);

module.exports = router;