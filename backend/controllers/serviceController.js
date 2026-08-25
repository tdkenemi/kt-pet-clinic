const Service = require('../models/Service');

exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ createdAt: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.getAllServicesAdmin = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const { name, emoji, description, category, basePrice, estimatedDuration, clinicServiceAvailable, homeServiceAvailable, isActive, allowedPaymentMethods } = req.body;
    if (!name) return res.status(400).json({ message: 'Tên dịch vụ là bắt buộc.' });

    const existing = await Service.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Tên dịch vụ đã tồn tại.' });

    const service = await Service.create({ name, emoji, description, category, basePrice, estimatedDuration, clinicServiceAvailable, homeServiceAvailable, isActive, allowedPaymentMethods: allowedPaymentMethods || ['Cash', 'QR'] });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    res.json({ message: 'Đã xóa dịch vụ' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
