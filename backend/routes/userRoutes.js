const express = require('express');
const router = express.Router();
const { 
  getAllUsers, getMe, updateMe, changePassword,
  makeAdmin, deleteUser, updateUser,
  getUserAppointments, getUserPets
} = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

// User tự quản lý
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/me/password', protect, changePassword);

// Admin routes
router.get('/', protect, admin, getAllUsers);
router.put('/:id/make-admin', protect, admin, makeAdmin);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);
router.get('/:id/appointments', protect, admin, getUserAppointments);
router.get('/:id/pets', protect, admin, getUserPets);

module.exports = router;
