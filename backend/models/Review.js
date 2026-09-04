const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true // Mỗi lịch hẹn chỉ được đánh giá 1 lần
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: { type: String, default: '' },
  images: [{ type: String }], // Base64 hoặc URL ảnh minh chứng

  // Kiểm duyệt
  isPublic: { type: Boolean, default: true }, // Admin có thể ẩn

  // Admin phản hồi
  adminReply: { type: String },
  repliedAt: { type: Date },

}, { timestamps: true });

// Index để query nhanh
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ isPublic: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
