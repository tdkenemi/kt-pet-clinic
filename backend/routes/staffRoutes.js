const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
  .get(staffController.getAllStaffs)
  .post(protect, admin, staffController.createStaff);

router.route('/:id')
  .put(protect, admin, staffController.updateStaff)
  .delete(protect, admin, staffController.deleteStaff);

module.exports = router;
