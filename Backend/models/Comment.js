// backend/models/Comment.js
const { pool } = require('../config/db');

class Comment {
    static async getCommentsByThreadId(threadId) {
        const result = await pool.query(
            'SELECT * FROM comments WHERE thread_id = $1 ORDER BY created_at ASC',
            [threadId]
        );
        return result.rows;
    }

    static async createComment(threadId, author, content) {
        const commentDate = new Date().toISOString().split('T')[0];
        const result = await pool.query(
            'INSERT INTO comments (thread_id, author, content, comment_date) VALUES ($1, $2, $3, $4) RETURNING *',
            [threadId, author, content, commentDate]
        );
        return result.rows[0]; // Mengembalikan data komentar yang baru dibuat
    }
}

module.exports = Comment;