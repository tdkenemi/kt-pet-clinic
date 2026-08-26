const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  petId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  vetId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  date:     { type: String, required: true }, // YYYY-MM-DD
  timeSlot: { type: String, required: true }, // "09:00 - 10:00"
  // Dịch vụ
  services: [{
    name: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  // service:  { type: String, required: true }, // Đã thay bằng mảng services
  reason:   { type: String, required: true },

  // Địa điểm dịch vụ
  serviceLocation: {
    type: String,
    enum: ['clinic', 'home'],
    default: 'clinic'
  },
  homeAddress: { type: String }, // Địa chỉ nếu chọn tại nhà
  travelFee:   { type: Number, default: 0 }, // Phí di chuyển (Admin điền khi duyệt)

  // Trạng thái lịch
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
    required: true
  },

  // Ghi chú & thông tin phòng khám
  clinicNote: { type: String },
  notes:      { type: String }, // Ghi chú nội bộ Admin
  billingDetails: {
    vetName:       { type: String },
    vetPhone:      { type: String },
    clinicAddress: { type: String },
    price:         { type: Number } // Giá thực tế Admin xác nhận
  },

  // Thanh toán
  estimatedPrice: { type: Number, default: 0 }, // Giá tham khảo lúc đặt
  totalPrice:     { type: Number },             // Giá thực tế (sau khi Admin xác nhận)
  paymentMethod: {
    type: String,
    enum: ['Cash', 'QR', 'BankTransfer', 'Visa', 'VNPay', 'Unpaid'],
    default: 'Unpaid'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'RefundPending', 'Refunded'],
    default: 'Pending'
  },
  allowedPaymentMethods: {
    type: [String],
    default: ['Cash', 'QR', 'VNPay']
  },

  // Timestamps sự kiện
  confirmedAt:       { type: Date },
  completedAt:       { type: Date },
  cancelledAt:       { type: Date },
  cancellationReason:{ type: String },
  paidAt:            { type: Date },

}, { timestamps: true });

// [FIX C-03] Unique compound index ngăn double-booking
// Chỉ enforce khi lịch còn active (pending/confirmed), không chặn lịch đã hủy/hoàn thành
appointmentSchema.index(
  { date: 1, timeSlot: 1, vetId: 1 },
  {
    unique: true,
    sparse: true, // Cho phép vetId là null (chưa phân bác sĩ)
    partialFilterExpression: {
      status: { $in: ['pending', 'confirmed'] },
      vetId: { $exists: true, $ne: null } // Chỉ enforce khi đã chọn bác sĩ
    },
    name: 'prevent_double_booking'
  }
);
// Index phụ để tăng tốc query
appointmentSchema.index({ date: 1, timeSlot: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
