// backend/controllers/threadController.js
const Thread = require('../models/Thread');
const Comment = require('../models/Comment');

exports.getAllThreads = async (req, res) => {
    try {
        const threads = await Thread.getAllThreads();
        res.json(threads);
    } catch (err) {
        console.error('Error fetching threads:', err.message);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

exports.createThread = async (req, res) => {
    const { title, author, category, content } = req.body;
    if (!title || !author || !category || !content) {
        return res.status(400).json({ message: 'Semua kolom harus diisi.' });
    }
    try {
        const newThread = await Thread.createThread(title, author, category, content);
        res.status(201).json(newThread);
    } catch (err) {
        console.error('Error creating thread:', err.message);
        res.status(500).json({ message: 'Gagal membuat topik forum: ' + err.message });
    }
};

exports.toggleLike = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'like' or 'unlike'

    try {
        const increment = (action === 'like') ? 1 : -1;
        const newLikesCount = await Thread.updateThreadLikes(id, increment);

        if (newLikesCount !== null) {
            res.status(200).json({ message: 'Status like diperbarui', newLikesCount });
        } else {
            res.status(404).json({ message: 'Topik tidak ditemukan' });
        }
    } catch (err) {
        console.error('Error toggling like:', err.message);
        res.status(500).json({ message: 'Gagal memperbarui status like: ' + err.message });
    }
};

exports.addComment = async (req, res) => {
    const { id } = req.params; // threadId
    const { author, content } = req.body;
    if (!author || !content) {
        return res.status(400).json({ message: 'Penulis dan isi komentar harus diisi.' });
    }
    try {
        const newComment = await Comment.createComment(id, author, content);
        const newCommentsCount = await Thread.updateThreadCommentsCount(id, 1); // Increment comment count in thread

        res.status(201).json({ comment: newComment, newCommentsCount });
    } catch (err) {
        console.error('Error adding comment:', err.message);
        res.status(500).json({ message: 'Gagal menambahkan komentar: ' + err.message });
    }
};

exports.getCommentsForThread = async (req, res) => {
    const { id } = req.params;
    try {
        const comments = await Comment.getCommentsByThreadId(id);
        res.json(comments);
    } catch (err) {
        console.error('Error fetching comments:', err.message);
        res.status(500).json({ message: 'Gagal mengambil komentar: ' + err.message });
    }
};