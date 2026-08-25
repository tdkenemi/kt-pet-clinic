const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  emoji: { type: String, default: '🩺' },
  description: { type: String },
  category: {
    type: String,
    enum: ['Medical', 'Grooming', 'Hotel', 'HomeService', 'Other'],
    required: true,
    default: 'Other'
  },
  basePrice: { type: Number, default: 0, min: 0 }, // Giá tham khảo (VNĐ)
  estimatedDuration: { type: Number, default: 60 }, // Phút
  clinicServiceAvailable: { type: Boolean, default: true }, // Có thể phục vụ tại phòng khám
  homeServiceAvailable: { type: Boolean, default: false }, // Có thể phục vụ tại nhà
  isActive: { type: Boolean, default: true },
  allowedPaymentMethods: { 
    type: [String], 
    enum: ['Cash', 'QR', 'BankTransfer', 'Visa', 'VNPay'], 
    default: ['Cash', 'QR', 'VNPay'] 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
