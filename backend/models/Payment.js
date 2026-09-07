const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionCode: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['Cash', 'QR', 'BankTransfer'],
    default: 'QR'
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED'],
    default: 'PENDING'
  },
  // Bank info
  bankCode: { type: String },
  accountNumber: { type: String },
  accountName: { type: String },
  transferDescription: { type: String },
  
  // Provider info (SePay/Casso/etc.)
  provider: { type: String, default: 'VietQR' },
  providerTransactionId: { type: String },
  
  paidAt: { type: Date },
  expiredAt: { type: Date },
}, { timestamps: true });

// Index for searching
paymentSchema.index({ appointmentId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
