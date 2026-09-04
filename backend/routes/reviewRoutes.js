const express = require('express');
const router = express.Router();
const {
  createReview,
  getPublicReviews,
  getMyReviews,
  checkReviewed,
  getAllReviews,
  replyReview,
  togglePublic,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public
router.get('/', getPublicReviews);

// User routes
router.post('/', protect, createReview);
router.get('/my-reviews', protect, getMyReviews);
router.get('/check/:appointmentId', protect, checkReviewed);

// Admin routes
router.get('/admin/all', protect, admin, getAllReviews);
router.put('/:id/reply', protect, admin, replyReview);
router.patch('/:id/toggle-public', protect, admin, togglePublic);
router.delete('/:id', protect, admin, deleteReview);

module.exports = router;
