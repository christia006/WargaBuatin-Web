// backend/models/Thread.js
const { pool } = require('../config/db'); // ⭐ GANTI INI ⭐

class Thread {
    static async getAllThreads() {
        // Mengambil threads dan mengurutkan berdasarkan created_at terbaru
        const result = await pool.query('SELECT * FROM threads ORDER BY created_at DESC');
        return result.rows;
    }

    static async createThread(title, author, category, content) {
        const postDate = new Date().toISOString().split('T')[0];
        const result = await pool.query(
            'INSERT INTO threads (title, author, category, content, post_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, author, category, content, postDate]
        );
        return result.rows[0]; // Mengembalikan data thread yang baru dibuat, termasuk ID dan nilai default
    }

    static async updateThreadLikes(id, increment) {
        const result = await pool.query(
            'UPDATE threads SET likes_count = likes_count + $1 WHERE id = $2 RETURNING likes_count',
            [increment, id]
        );
        return result.rows[0] ? result.rows[0].likes_count : null; // Mengembalikan jumlah likes yang baru
    }

    static async updateThreadCommentsCount(id, increment) {
        const result = await pool.query(
            'UPDATE threads SET comments_count = comments_count + $1 WHERE id = $2 RETURNING comments_count',
            [increment, id]
        );
        return result.rows[0] ? result.rows[0].comments_count : null; // Mengembalikan jumlah komentar yang baru
    }
}

module.exports = Thread;