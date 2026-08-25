const express = require('express');
const router = express.Router();
const { getServices, getAllServicesAdmin, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public or User protected? Let's make it user protected like other things, or public.
// Usually booking fetches are protected if booking requires login.
router.get('/', getServices);

// Admin routes
router.get('/admin', protect, admin, getAllServicesAdmin);
router.post('/', protect, admin, createService);
router.put('/:id', protect, admin, updateService);
router.delete('/:id', protect, admin, deleteService);

module.exports = router;
