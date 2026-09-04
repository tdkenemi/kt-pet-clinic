const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', protect, admin, medicalRecordController.getAllRecords);
router.get('/my-records', protect, medicalRecordController.getMyRecords);
router.post('/', protect, admin, medicalRecordController.createRecord);
router.get('/pet/:petId', protect, medicalRecordController.getRecordsByPet);
router.get('/appointment/:appointmentId', protect, medicalRecordController.getRecordByAppointment);
router.put('/:id', protect, admin, medicalRecordController.updateRecord);

module.exports = router;
