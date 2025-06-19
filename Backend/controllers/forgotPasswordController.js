// backend/controllers/forgotPasswordController.js
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

// Controller untuk verifikasi username dan jawaban keamanan
const verifyAccount = async (req, res) => {
    const { username, securityAnswer, selectedQuestion } = req.body;

    // Basic validation
    if (!username || !securityAnswer || !selectedQuestion) {
        return res.status(400).json({ msg: 'Mohon lengkapi semua bidang.' });
    }

    let client;
    try {
        client = await pool.connect();
        // Cari pengguna berdasarkan username
        const userResult = await client.query(
            'SELECT id, username, pertanyaan_keamanan, jawaban_keamanan FROM users WHERE username = $1',
            [username]
        );

        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ msg: 'Username tidak ditemukan.' });
        }

        // Verifikasi pertanyaan yang dipilih sama dengan yang ada di database
        if (user.pertanyaan_keamanan !== selectedQuestion) {
            return res.status(401).json({ msg: 'Pertanyaan keamanan yang dipilih tidak cocok dengan akun ini.' });
        }

        // ⭐ Penting: Verifikasi jawaban keamanan (plain text dari frontend) dengan hash di database ⭐
        const isAnswerMatch = await bcrypt.compare(securityAnswer, user.jawaban_keamanan);

        if (!isAnswerMatch) {
            return res.status(401).json({ msg: 'Jawaban keamanan salah.' });
        }

        // Jika verifikasi berhasil, kirimkan ID pengguna untuk langkah selanjutnya (reset password)
        res.status(200).json({ msg: 'Verifikasi berhasil. Anda dapat mereset password.', userId: user.id });

    } catch (error) {
        console.error('Error during account verification:', error.message);
        res.status(500).json({ msg: 'Terjadi kesalahan server.' });
    } finally {
        if (client) {
            client.release();
        }
    }
};

// Controller untuk mereset password
const resetPassword = async (req, res) => {
    const { userId, newPassword } = req.body;

    // Basic validation
    if (!userId || !newPassword) {
        return res.status(400).json({ msg: 'ID pengguna dan password baru tidak boleh kosong.' });
    }

    // Validasi kekuatan password di backend (harus sama dengan frontend)
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
        return res.status(400).json({ msg: 'Password harus minimal 8 karakter dengan huruf besar, kecil, angka, dan simbol.' });
    }

    let client;
    try {
        client = await pool.connect();
        // Hash password baru
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password pengguna di database
        await client.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, userId]
        );

        res.status(200).json({ msg: 'Password berhasil direset.' });

    } catch (error) {
        console.error('Error resetting password:', error.message);
        res.status(500).json({ msg: 'Terjadi kesalahan server.' });
    } finally {
        if (client) {
            client.release();
        }
    }
};

module.exports = {
    verifyAccount,
    resetPassword
};