const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  appointmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment', 
    required: true 
  },
  diagnosis: { type: String, required: true },
  treatment: { type: String, required: true },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
