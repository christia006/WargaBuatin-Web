// backend/routes/threadRoutes.js
const express = require('express');
const { getAllThreads, createThread, toggleLike, addComment, getCommentsForThread } = require('../controllers/threadController');
const router = express.Router();

router.get('/', getAllThreads); // GET all threads
router.post('/', createThread); // CREATE a new thread
router.post('/:id/like', toggleLike); // TOGGLE like on a thread
router.post('/:id/comments', addComment); // ADD a comment to a thread
router.get('/:id/comments', getCommentsForThread); // GET comments for a specific thread

module.exports = router;