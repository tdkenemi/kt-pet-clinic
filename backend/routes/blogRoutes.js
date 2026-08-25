const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', blogController.getAllBlogs);

// Login required
router.post('/', protect, blogController.createBlog);           // Mọi user đăng nhập đều được tạo bài
router.get('/my-blogs', protect, blogController.getMyBlogs);   // Lấy bài của mình

// Owner hoặc admin
router.put('/:id', protect, blogController.updateBlog);
router.delete('/:id', protect, blogController.deleteBlog);

// Comments
router.post('/:id/comments', protect, blogController.addComment);
router.delete('/:id/comments/:commentId', protect, blogController.deleteComment);

// Likes
router.post('/:id/like', protect, blogController.toggleLike);

module.exports = router;
