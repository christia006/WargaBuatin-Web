// backend/middleware/adminMiddleware.js
// authMiddleware harus sudah jalan terlebih dahulu untuk mengisi req.user
module.exports = function(req, res, next) {
    // req.user.role harus sudah diatur oleh authMiddleware
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Akses Ditolak: Anda tidak memiliki hak akses administrator.' });
    }
    next();
};