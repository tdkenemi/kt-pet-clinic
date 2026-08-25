const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');
const dayjs = require('dayjs');

// Lấy danh sách bệnh án (Admin)
exports.getAllRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate({
        path: 'appointmentId',
        populate: [
          { path: 'petId', select: 'name species breed age' },
          { path: 'userId', select: 'fullName phone' }
        ]
      })
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy bệnh án theo ID thú cưng
exports.getRecordsByPet = async (req, res) => {
  try {
    // Tìm các lịch hẹn của thú cưng này
    const appointments = await Appointment.find({ petId: req.params.petId }).select('_id');
    const aptIds = appointments.map(a => a._id);

    const records = await MedicalRecord.find({ appointmentId: { $in: aptIds } })
      .populate({
        path: 'appointmentId',
        select: 'date timeSlot services vetId',
        populate: { path: 'vetId', select: 'fullName' }
      })
      .sort({ createdAt: -1 });
      
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy 1 bệnh án theo ID lịch hẹn
exports.getRecordByAppointment = async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({ appointmentId: req.params.appointmentId });
    if (!record) return res.status(404).json({ message: 'Chưa có bệnh án cho lịch hẹn này' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo bệnh án mới
exports.createRecord = async (req, res) => {
  try {
    const { appointmentId, diagnosis, treatment, notes } = req.body;
    
    if (!appointmentId || !diagnosis || !treatment) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }

    // Kiểm tra xem đã có bệnh án chưa
    let record = await MedicalRecord.findOne({ appointmentId });
    if (record) {
      return res.status(400).json({ message: 'Lịch hẹn này đã có bệnh án' });
    }

    record = await MedicalRecord.create({
      appointmentId,
      diagnosis,
      treatment,
      notes
    });

    // Tích hợp đồng bộ vào Pet.medicalHistory
    const appointment = await Appointment.findById(appointmentId).populate('petId');
    if (appointment && appointment.petId) {
      const dateStr = dayjs(appointment.date).format('DD/MM/YYYY');
      const servicesStr = appointment.services.map(s => s.name).join(', ');
      
      const historyStr = `[${dateStr}] Dịch vụ: ${servicesStr}. Chẩn đoán: ${diagnosis}. Hướng xử lý: ${treatment}`;
      
      await Pet.findByIdAndUpdate(appointment.petId._id, {
        $push: { medicalHistory: historyStr }
      });
    }

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật bệnh án
exports.updateRecord = async (req, res) => {
  try {
    const { diagnosis, treatment, notes } = req.body;
    
    // Tìm bệnh án cũ để lấy string cũ
    const oldRecord = await MedicalRecord.findById(req.params.id).populate({
      path: 'appointmentId',
      populate: { path: 'petId' }
    });
    
    if (!oldRecord) return res.status(404).json({ message: 'Không tìm thấy bệnh án' });

    // Cập nhật đồng bộ vào bảng Pet
    const appointment = oldRecord.appointmentId;
    if (appointment && appointment.petId) {
      const dateStr = dayjs(appointment.date).format('DD/MM/YYYY');
      const servicesStr = appointment.services.map(s => s.name).join(', ');
      
      const oldHistoryStr = `[${dateStr}] Dịch vụ: ${servicesStr}. Chẩn đoán: ${oldRecord.diagnosis}. Hướng xử lý: ${oldRecord.treatment}`;
      const newHistoryStr = `[${dateStr}] Dịch vụ: ${servicesStr}. Chẩn đoán: ${diagnosis}. Hướng xử lý: ${treatment}`;
      
      // Xóa chuỗi cũ và thêm chuỗi mới
      await Pet.findByIdAndUpdate(appointment.petId._id, {
        $pull: { medicalHistory: oldHistoryStr }
      });
      await Pet.findByIdAndUpdate(appointment.petId._id, {
        $push: { medicalHistory: newHistoryStr }
      });
    }
    
    const record = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      { diagnosis, treatment, notes },
      { new: true }
    );
    
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
