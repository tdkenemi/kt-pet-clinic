const express = require('express');
const router = express.Router();
const { addVaccination, getPetVaccinations } = require('../controllers/vaccinationController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/', protect, admin, addVaccination);
router.get('/pet/:petId', protect, getPetVaccinations);

module.exports = router;
