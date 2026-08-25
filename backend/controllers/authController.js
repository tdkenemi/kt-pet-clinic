const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ====== Email transporter (Gmail SMTP) ======
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

// Đăng ký tài khoản thường
exports.register = async (req, res) => {
  const { fullName, email, password, phone } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email đã tồn tại' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đăng nhập tài khoản thường
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đăng nhập bằng Google
exports.googleLogin = async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { name, email, picture, sub } = ticket.getPayload();
    
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fullName: name,
        email,
        googleId: sub,
        avatar: picture,
        role: 'customer'
      });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: 'Xác thực Google thất bại' });
  }
};

/**
 * POST /api/auth/forgot-password
 * Tạo OTP và gửi qua email (hoặc tìm theo phone)
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ message: 'Vui lòng nhập email' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      // Bảo mật: không tiết lộ email tồn tại hay không
      return res.json({ message: 'Nếu email tồn tại, mã OTP đã được gửi.' });
    }

    // Không cho reset tài khoản Google (chưa có password)
    if (user.googleId && !user.password) {
      return res.status(400).json({ message: 'Tài khoản này đăng nhập bằng Google, không cần mật khẩu.' });
    }

    // Tạo OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    user.resetOtp = otp;
    user.resetOtpExpiry = expiry;
    await user.save();

    // Log OTP ra console (để test khi chưa có Gmail SMTP config)
    console.log(`[OTP] Email: ${email} — OTP: ${otp} — Hết hạn: ${expiry.toLocaleTimeString('vi-VN')}`);

    // Gửi email nếu có cấu hình Gmail
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        const transporter = createTransporter();
        await transporter.sendMail({
          from: `"KT Pet Clinic 🐾" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: 'Mã xác nhận đặt lại mật khẩu — KT Pet Clinic',
          html: `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #0d9488, #0891b2); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                  <span style="font-size: 28px;">🐾</span>
                </div>
                <h2 style="color: #0f172a; font-size: 22px; margin: 0;">KT Pet Clinic</h2>
              </div>
              <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                <p style="color: #475569; margin: 0 0 16px;">Xin chào <strong>${user.fullName}</strong>,</p>
                <p style="color: #475569; margin: 0 0 20px;">Bạn đã yêu cầu đặt lại mật khẩu. Nhập mã OTP bên dưới:</p>
                <div style="background: linear-gradient(135deg, #0d9488, #0891b2); border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
                  <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: white;">${otp}</span>
                </div>
                <p style="color: #94a3b8; font-size: 13px; margin: 0;">⏱ Mã có hiệu lực trong <strong>10 phút</strong>. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
              </div>
              <p style="color: #cbd5e1; font-size: 12px; text-align: center; margin-top: 16px;">© 2026 KT Pet Clinic 🐾</p>
            </div>
          `,
        });
        return res.json({ message: 'Mã OTP đã được gửi về email của bạn.' });
      } catch (mailErr) {
        console.error('[Mail Error]', mailErr.message);
        // Nếu gửi mail thất bại, vẫn trả về OTP trong response (chỉ dùng cho dev/demo)
        return res.json({ 
          message: 'Mã OTP (demo — email chưa config):',
          devOtp: otp 
        });
      }
    } else {
      // Chế độ demo: trả OTP thẳng về response
      return res.json({ 
        message: 'Mã OTP đã được tạo (chế độ demo — cấu hình GMAIL_USER để gửi email thật):',
        devOtp: otp
      });
    }
  } catch (error) {
    console.error('[ForgotPassword Error]', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * POST /api/auth/reset-password
 * Xác thực OTP và đặt lại mật khẩu mới
 */
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Thiếu thông tin' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới cần ít nhất 6 ký tự' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

    // Kiểm tra OTP
    if (!user.resetOtp || user.resetOtp !== otp.trim()) {
      return res.status(400).json({ message: 'Mã OTP không đúng' });
    }
    if (!user.resetOtpExpiry || new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ message: 'Mã OTP đã hết hạn, vui lòng yêu cầu lại' });
    }

    // Đặt mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.json({ message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
