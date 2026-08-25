const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');

// [Admin] Lấy danh sách tất cả user (tất cả roles)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [User] Lấy thông tin của chính mình
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [User] Cập nhật thông tin của chính mình (hỗ trợ Base64 avatar)
exports.updateMe = async (req, res) => {
  const { fullName, phone, avatar } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    if (fullName) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    // Chấp nhận cả URL và Base64 (data:image/...)
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    const updated = user.toObject();
    delete updated.password;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [User] Đổi mật khẩu
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    if (!user.password) return res.status(400).json({ message: 'Tài khoản Google không có mật khẩu' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Admin] Cập nhật role → admin
exports.makeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    user.role = 'admin';
    await user.save();
    res.json({ message: 'Đã cấp quyền admin', user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Admin] Xóa user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Không thể xóa tài khoản admin' });
    await user.deleteOne();
    res.json({ message: 'Đã xóa người dùng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Admin] Cập nhật thông tin user (fullName, phone, role, avatar)
exports.updateUser = async (req, res) => {
  const { fullName, phone, role, avatar } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    if (fullName) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (role && ['customer', 'admin', 'veterinarian'].includes(role)) user.role = role;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    const updated = user.toObject();
    delete updated.password;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Admin] Lấy lịch sử lịch hẹn của 1 user
exports.getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.params.id })
      .populate('petId', 'name species')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Admin] Lấy thú cưng của 1 user
exports.getUserPets = async (req, res) => {
  try {
    const pets = await Pet.find({ ownerId: req.params.id });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
