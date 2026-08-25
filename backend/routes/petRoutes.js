const express = require('express');
const router = express.Router();
const { addPet, getMyPets, getAllPets, updatePet, deletePet } = require('../controllers/petController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/', protect, addPet);
router.get('/my-pets', protect, getMyPets);
router.get('/', protect, admin, getAllPets);
router.put('/:id', protect, updatePet);
router.delete('/:id', protect, deletePet);

module.exports = router;
