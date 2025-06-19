const { pool } = require('../config/db');

// @desc    Get all forum threads
// @route   GET /api/forum
// @access  Public
const getForumThreads = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM forum_threads ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching forum threads:', error.message);
        res.status(500).json({ message: 'Gagal mengambil thread forum.', detail: error.message });
    }
};

// @desc    Create a new forum thread
// @route   POST /api/forum
// @access  Private (e.g., authenticated users)
const createForumThread = async (req, res) => {
    // console.log('Request body:', req.body); // Tambahkan log ini untuk melihat data yang masuk
    // console.log('Authenticated user:', req.user); // Tambahkan log ini untuk melihat data user dari token

    const { title, category, content } = req.body;
    const authorId = req.user.id; // Get user ID from authenticated token
    const authorName = req.user.username; // Get username from authenticated token

    // Basic validation
    if (!title || !category || !content) {
        return res.status(400).json({ message: 'Judul, kategori, dan konten tidak boleh kosong.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO forum_threads (title, author_id, author_name, category, content) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, authorId, authorName, category, content]
        );
        console.log('✅ New forum thread created successfully:', result.rows[0]); // Log success
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating forum thread:', error.message);
        res.status(500).json({ message: 'Gagal membuat forum. Silakan coba lagi.', detail: error.message });
    }
};

// @desc    Get a single forum thread by ID
// @route   GET /api/forum/:id
// @access  Public
const getForumThreadById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM forum_threads WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Thread forum tidak ditemukan.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching forum thread by ID:', error.message);
        res.status(500).json({ message: 'Gagal mengambil thread forum.', detail: error.message });
    }
};

// @desc    Update a forum thread
// @route   PUT /api/forum/:id
// @access  Private (only thread author or admin)
const updateForumThread = async (req, res) => {
    const { id } = req.params;
    const { title, category, content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!title || !category || !content) {
        return res.status(400).json({ message: 'Judul, kategori, dan konten tidak boleh kosong.' });
    }

    try {
        const threadResult = await pool.query('SELECT author_id FROM forum_threads WHERE id = $1', [id]);
        if (threadResult.rows.length === 0) {
            return res.status(404).json({ message: 'Thread forum tidak ditemukan.' });
        }

        const thread = threadResult.rows[0];

        // Check if the user is the author or an admin
        if (thread.author_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Anda tidak memiliki izin untuk mengedit thread ini.' });
        }

        const result = await pool.query(
            'UPDATE forum_threads SET title = $1, category = $2, content = $3, created_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [title, category, content, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating forum thread:', error.message);
        res.status(500).json({ message: 'Gagal memperbarui thread forum.', detail: error.message });
    }
};

// @desc    Delete a forum thread
// @route   DELETE /api/forum/:id
// @access  Private (only thread author or admin)
const deleteForumThread = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        const threadResult = await pool.query('SELECT author_id FROM forum_threads WHERE id = $1', [id]);
        if (threadResult.rows.length === 0) {
            return res.status(404).json({ message: 'Thread forum tidak ditemukan.' });
        }

        const thread = threadResult.rows[0];

        // Check if the user is the author or an admin
        if (thread.author_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Anda tidak memiliki izin untuk menghapus thread ini.' });
        }

        await pool.query('DELETE FROM forum_threads WHERE id = $1', [id]);
        res.status(200).json({ message: 'Thread forum berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting forum thread:', error.message);
        res.status(500).json({ message: 'Gagal menghapus thread forum.', detail: error.message });
    }
};

// @desc    Add a comment to a forum thread
// @route   POST /api/forum/:id/comments
// @access  Private (authenticated users)
const addForumComment = async (req, res) => {
    const { id } = req.params; // thread_id
    const { content } = req.body;
    const authorId = req.user.id;
    const authorName = req.user.username;

    if (!content) {
        return res.status(400).json({ message: 'Konten komentar tidak boleh kosong.' });
    }

    try {
        // Verify the thread exists
        const threadCheck = await pool.query('SELECT id FROM forum_threads WHERE id = $1', [id]);
        if (threadCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Thread forum tidak ditemukan.' });
        }

        const result = await pool.query(
            'INSERT INTO forum_comments (thread_id, author_id, author_name, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, authorId, authorName, content]
        );

        // Increment comments_count in forum_threads table
        await pool.query(
            'UPDATE forum_threads SET comments_count = comments_count + 1 WHERE id = $1',
            [id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding forum comment:', error.message);
        res.status(500).json({ message: 'Gagal menambahkan komentar.', detail: error.message });
    }
};

// @desc    Get all comments for a forum thread
// @route   GET /api/forum/:id/comments
// @access  Public
const getForumComments = async (req, res) => {
    const { id } = req.params; // thread_id
    try {
        const result = await pool.query('SELECT * FROM forum_comments WHERE thread_id = $1 ORDER BY created_at ASC', [id]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching forum comments:', error.message);
        res.status(500).json({ message: 'Gagal mengambil komentar forum.', detail: error.message });
    }
};

// @desc    Delete a forum comment
// @route   DELETE /api/forum/comments/:commentId
// @access  Private (only comment author or admin or thread author)
const deleteForumComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        const commentResult = await pool.query('SELECT author_id, thread_id FROM forum_comments WHERE id = $1', [commentId]);
        if (commentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Komentar tidak ditemukan.' });
        }

        const comment = commentResult.rows[0];

        // Check if the user is the comment author
        if (comment.author_id === userId) {
            await pool.query('DELETE FROM forum_comments WHERE id = $1', [commentId]);
            // Decrement comments_count in forum_threads table
            await pool.query('UPDATE forum_threads SET comments_count = comments_count - 1 WHERE id = $1', [comment.thread_id]);
            return res.status(200).json({ message: 'Komentar berhasil dihapus.' });
        }

        // If not comment author, check if user is thread author or admin
        const threadResult = await pool.query('SELECT author_id FROM forum_threads WHERE id = $1', [comment.thread_id]);
        if (threadResult.rows.length === 0) {
            // This case ideally shouldn't happen if comment refers to existing thread
            return res.status(404).json({ message: 'Thread terkait komentar tidak ditemukan.' });
        }
        const threadAuthorId = threadResult.rows[0].author_id;

        if (threadAuthorId === userId || userRole === 'admin') {
            await pool.query('DELETE FROM forum_comments WHERE id = $1', [commentId]);
            // Decrement comments_count in forum_threads table
            await pool.query('UPDATE forum_threads SET comments_count = comments_count - 1 WHERE id = $1', [comment.thread_id]);
            return res.status(200).json({ message: 'Komentar berhasil dihapus.' });
        }

        return res.status(403).json({ message: 'Anda tidak memiliki izin untuk menghapus komentar ini.' });

    } catch (error) {
        console.error('Error deleting forum comment:', error.message);
        res.status(500).json({ message: 'Gagal menghapus komentar.', detail: error.message });
    }
};


// @desc    Like a forum thread
// @route   POST /api/forum/:id/like
// @access  Private (authenticated users)
const likeForumThread = async (req, res) => {
    const { id: threadId } = req.params;
    const userId = req.user.id;

    try {
        // Check if the user has already liked this thread
        const existingLike = await pool.query(
            'SELECT * FROM forum_likes WHERE thread_id = $1 AND user_id = $2',
            [threadId, userId]
        );

        if (existingLike.rows.length > 0) {
            // User already liked, so unlike it
            await pool.query(
                'DELETE FROM forum_likes WHERE thread_id = $1 AND user_id = $2',
                [threadId, userId]
            );
            await pool.query(
                'UPDATE forum_threads SET likes = likes - 1 WHERE id = $1',
                [threadId]
            );
            return res.status(200).json({ message: 'Unlike berhasil.', liked: false });
        } else {
            // User hasn't liked, so like it
            await pool.query(
                'INSERT INTO forum_likes (thread_id, user_id) VALUES ($1, $2)',
                [threadId, userId]
            );
            await pool.query(
                'UPDATE forum_threads SET likes = likes + 1 WHERE id = $1',
                [threadId]
            );
            return res.status(200).json({ message: 'Like berhasil.', liked: true });
        }
    } catch (error) {
        console.error('Error liking/unliking forum thread:', error.message);
        res.status(500).json({ message: 'Gagal memproses like/unlike.', detail: error.message });
    }
};

// @desc    Check if user has liked a forum thread
// @route   GET /api/forum/:id/liked
// @access  Private (authenticated users)
const checkForumThreadLiked = async (req, res) => {
    const { id: threadId } = req.params;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            'SELECT * FROM forum_likes WHERE thread_id = $1 AND user_id = $2',
            [threadId, userId]
        );
        res.status(200).json({ liked: result.rows.length > 0 });
    } catch (error) {
        console.error('Error checking forum thread like status:', error.message);
        res.status(500).json({ message: 'Gagal memeriksa status like.', detail: error.message });
    }
};


module.exports = {
    getForumThreads,
    createForumThread,
    getForumThreadById,
    updateForumThread,
    deleteForumThread,
    addForumComment,
    getForumComments,
    deleteForumComment,
    likeForumThread,
    checkForumThreadLiked
};