// routes/forumRoutes.js
const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/forumController'); // Assuming these functions are in a controller

const { protect } = require('../middleware/authMiddleware'); // Assuming you have an authMiddleware

// Public routes
router.get('/', getForumThreads);
router.get('/:id', getForumThreadById);
router.get('/:id/comments', getForumComments);
router.get('/:id/liked', protect, checkForumThreadLiked); // This one requires protection

// Private routes (require authentication)
router.post('/', protect, createForumThread); // ⭐ Check this line (line 23 based on your error) ⭐
router.put('/:id', protect, updateForumThread);
router.delete('/:id', protect, deleteForumThread);
router.post('/:id/comments', protect, addForumComment);
router.delete('/comments/:commentId', protect, deleteForumComment);
router.post('/:id/like', protect, likeForumThread);


module.exports = router;