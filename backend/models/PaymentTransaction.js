const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  amount: { type: Number, required: true },
  bankCode: { type: String },
  accountNumber: { type: String },
  transferDescription: { type: String },
  status: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'], default: 'PENDING' },
  providerTransactionId: { type: String, unique: true, sparse: true }, // Transaction ID từ ngân hàng/provider (Casso ID)
  paidAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
