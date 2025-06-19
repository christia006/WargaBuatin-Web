// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();

// ✅ Import controller untuk autentikasi
const { register, login } = require('../controllers/authController');

// ✅ Import controller untuk lupa password
const { verifyAccount, resetPassword } = require('../controllers/forgotPasswordController');

// ========================
// ✅ Rute Autentikasi
// ========================

// @route   POST /api/register
// @desc    Registrasi pengguna baru
// @access  Public
router.post('/register', register);

// @route   POST /api/login
// @desc    Login pengguna
// @access  Public
router.post('/login', login);

// ==============================
// ✅ Rute Lupa Password
// ==============================

// @route   POST /api/verify-account
// @desc    Verifikasi akun sebelum reset password
// @access  Public
router.post('/verify-account', verifyAccount);

// @route   POST /api/reset-password
// @desc    Atur ulang password
// @access  Public
router.post('/reset-password', resetPassword);

module.exports = router;
