const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  vaccineName: { type: String, required: true }, // Tên vắc-xin (vd: Dại, 5 bệnh)
  dateGiven: { type: Date, required: true },     // Ngày tiêm
  nextDueDate: { type: Date, required: true },   // Ngày hẹn tiêm nhắc lại
  vetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Bác sĩ tiêm
  notes: { type: String },                       // Ghi chú thêm
  status: { 
    type: String, 
    enum: ['completed', 'upcoming', 'overdue'], 
    default: 'completed' 
  }, // completed: Đã tiêm, upcoming: Sắp tới hạn, overdue: Quá hạn
}, { timestamps: true });

module.exports = mongoose.model('Vaccination', vaccinationSchema);
