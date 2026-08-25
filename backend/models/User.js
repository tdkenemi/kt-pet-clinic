const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google Auth
  googleId: { type: String },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ['customer', 'admin', 'veterinarian'], 
    default: 'customer',
    required: true
  },
  avatar: { type: String }, // URL hoặc Base64
  // Quên mật khẩu OTP
  resetOtp: { type: String },
  resetOtpExpiry: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
