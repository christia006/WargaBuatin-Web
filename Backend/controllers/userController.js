// backend/controllers/userController.js

const User = require('../models/User'); // Pastikan path ke model User sudah benar

// --- Fungsi registerUser ---
// Pastikan fungsi ini didefinisikan dan diekspor dengan 'exports.'
exports.registerUser = async (req, res) => {
    const { username, password, daerah, umur, pertanyaanKeamanan, jawabanKeamanan } = req.body;

    try {
        if (!username || !password || !daerah || !umur || !pertanyaanKeamanan || !jawabanKeamanan) {
            return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
        }

        const newUser = await User.create(username, password, daerah, umur, pertanyaanKeamanan, jawabanKeamanan);
        res.status(201).json({ message: 'Registrasi berhasil!', user: newUser });
    } catch (error) {
        console.error('Error saat registrasi pengguna:', error);
        res.status(500).json({ message: error.message || 'Terjadi kesalahan server saat registrasi.' });
    }
};

// --- Fungsi loginUser ---
// Pastikan fungsi ini didefinisikan dan diekspor dengan 'exports.'
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan password wajib diisi.' });
        }

        const user = await User.findByUsername(username);

        // --- MULAI LOG DEBUGGING ---
        console.log('--- DEBUG LOGIN START ---');
        console.log('Username dari frontend:', username);
        console.log('Password dari frontend (plain text):', password);
        console.log('User object dari DB:', user); // Sangat penting: Periksa apakah user ditemukan
        if (user) {
            console.log('Password dari DB (hashed):', user.password); // Sangat penting: Periksa hash password
        }
        // --- AKHIR LOG DEBUGGING ---

        if (!user) {
            // Jika user tidak ditemukan di database
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        // Penting: Pastikan user.password benar-benar berisi string hash
        // Jika user.password undefined/null/bukan string, bcrypt.compare akan error
        if (typeof user.password !== 'string' || user.password.length === 0) {
            console.error('ERROR: Password yang diambil dari database bukan string atau kosong.');
            return res.status(500).json({ message: 'Data password pengguna tidak valid di database.' });
        }

        const isMatch = await User.comparePassword(password, user.password);

        // --- LOG DEBUGGING ---
        console.log('Hasil bcrypt.compare (isMatch):', isMatch);
        console.log('--- DEBUG LOGIN END ---');
        // --- AKHIR LOG DEBUGGING ---

        if (!isMatch) {
            // Jika password tidak cocok
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        // Jika login berhasil
        res.status(200).json({
            message: 'Login berhasil!',
            user: {
                id: user.id,
                username: user.username,
                daerah: user.daerah,
                umur: user.umur
                // Jangan kirim password atau data sensitif lainnya ke frontend
            }
        });

    } catch (error) {
        // Jika terjadi error tak terduga dalam proses
        console.error('Error saat login pengguna (catch block):', error); // Ini adalah error yang paling penting!
        res.status(500).json({ message: 'Terjadi kesalahan server saat login. Silakan coba lagi.' });
    }
};