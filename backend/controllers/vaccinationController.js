const Vaccination = require('../models/Vaccination');
const Pet = require('../models/Pet');

// [Admin/Vet] Thêm lịch tiêm phòng mới
exports.addVaccination = async (req, res) => {
  try {
    const { petId, vaccineName, dateGiven, nextDueDate, notes } = req.body;
    if (!petId || !vaccineName || !dateGiven || !nextDueDate) {
      return res.status(400).json({ message: 'Vui lòng điền đủ thông tin bắt buộc' });
    }

    const vaccination = await Vaccination.create({
      petId,
      vaccineName,
      dateGiven,
      nextDueDate,
      vetId: req.user._id,
      notes,
      status: 'completed' // Mặc định khi vừa tiêm xong là completed, mũi tiếp theo (nextDueDate) sẽ được track riêng
    });

    res.status(201).json(vaccination);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [User/Admin/Vet] Lấy danh sách tiêm phòng của 1 thú cưng
exports.getPetVaccinations = async (req, res) => {
  try {
    const { petId } = req.params;
    
    // Nếu là user thường, kiểm tra xem pet có phải của họ không
    if (req.user.role === 'customer') {
      const pet = await Pet.findById(petId);
      if (!pet || pet.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Không có quyền truy cập hồ sơ này' });
      }
    }

    const vaccinations = await Vaccination.find({ petId })
      .populate('vetId', 'fullName')
      .sort({ dateGiven: -1 });
      
    // Update status logic động dựa vào nextDueDate (chỉ hiển thị)
    const today = new Date();
    const updatedStatusList = vaccinations.map(v => {
      const doc = v.toObject();
      const nextDue = new Date(doc.nextDueDate);
      if (nextDue < today && doc.status === 'completed') {
        doc.status = 'overdue';
      }
      return doc;
    });

    res.json(updatedStatusList);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
