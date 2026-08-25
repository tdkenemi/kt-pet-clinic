const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Người dùng không tồn tại' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
  }

  return res.status(401).json({ message: 'Không có quyền truy cập, không có token' });
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'veterinarian')) {
    next();
  } else {
    res.status(403).json({ message: 'Không có quyền truy cập, chỉ dành cho quản trị viên' });
  }
};

module.exports = { protect, admin };
