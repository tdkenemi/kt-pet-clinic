const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  species: { type: String, required: true },
  breed: { type: String },
  age: { type: Number },
  weightKg: { type: Number },
  medicalHistory: [{ type: String }],
  // Thông tin bổ sung
  gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
  color: { type: String },          // Màu lông
  microchipId: { type: String },    // Số microchip
  // Ảnh
  image: { type: String },          // Ảnh đại diện (Base64 hoặc URL)
  gallery: [{ type: String }],      // Album ảnh (tối đa 5 ảnh)
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Pet', petSchema);
