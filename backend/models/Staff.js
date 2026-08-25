const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  role:  { type: String, enum: ['Veterinarian', 'Groomer', 'Nurse', 'Admin'], required: true },
  bio:   { type: String },
  phone: { type: String },
  image: { type: String }, // URL
  specialties:     [{ type: String }], // ['Grooming', 'Surgery', 'Dental', ...]
  workingDays:     [{ type: Number, enum: [0,1,2,3,4,5,6] }], // 0=CN, 1=T2...
  maxAppointmentsPerDay: { type: Number, default: 10 },
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
