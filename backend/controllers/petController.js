const Pet = require('../models/Pet');

// [Customer/Admin] Thêm thú cưng
exports.addPet = async (req, res) => {
  const { name, species, breed, age, weightKg, ownerId, gender, color, microchipId, image, gallery } = req.body;
  try {
    const pet = await Pet.create({
      name, species, breed, age, weightKg,
      gender: gender || 'unknown',
      color, microchipId,
      image, gallery: gallery || [],
      ownerId: req.user.role === 'admin' && ownerId ? ownerId : req.user._id
    });
    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Customer] Lấy danh sách thú cưng của mình
exports.getMyPets = async (req, res) => {
  try {
    const pets = await Pet.find({ ownerId: req.user._id });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Admin] Lấy tất cả thú cưng
exports.getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find({}).populate('ownerId', 'fullName email');
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Customer/Admin] Cập nhật thú cưng
exports.updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Không tìm thấy thú cưng' });
    
    if (pet.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Không có quyền sửa' });
    }

    // Whitelist các field được phép cập nhật
    const allowedFields = ['name', 'species', 'breed', 'age', 'weightKg', 'medicalHistory', 
                           'gender', 'color', 'microchipId', 'image', 'gallery'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    if (req.user.role === 'admin' && req.body.ownerId) {
      updates.ownerId = req.body.ownerId;
    }

    const updated = await Pet.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Customer/Admin] Xóa thú cưng
exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Không tìm thấy thú cưng' });
    
    if (pet.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Không có quyền xoá' });
    }

    await pet.deleteOne();
    res.json({ message: 'Đã xóa thú cưng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
