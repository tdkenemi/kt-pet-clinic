const express = require('express');
const router = express.Router();
const { 
  getConversations, 
  getMessages, 
  sendMessage 
} = require('../controllers/messageController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/conversations', protect, admin, getConversations);
router.get('/:userId', protect, getMessages); // userId can be self or specific user
router.get('/', protect, getMessages); // get for self
router.post('/', protect, sendMessage);

module.exports = router;
