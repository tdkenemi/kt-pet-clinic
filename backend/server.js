const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const userRoutes = require('./routes/userRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const staffRoutes = require('./routes/staffRoutes');
const blogRoutes = require('./routes/blogRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const vaccinationRoutes = require('./routes/vaccinationRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Trong thực tế nên giới hạn lại theo frontend url
    methods: ['GET', 'POST']
  }
});

// Setup Socket.IO logic
io.on('connection', (socket) => {
  console.log('⚡ Socket connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('join_admin', () => {
    socket.join('admin_room');
    console.log('Admin joined admin_room');
  });

  socket.on('send_message', (data) => {
    // data = { senderId, receiverId, content, senderRole, ... }
    if (data.receiverId === 'admin') {
      io.to('admin_room').emit('receive_message', data);
    } else {
      io.to(data.receiverId).emit('receive_message', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('io', io);

// CORS - cho phép frontend truy cập
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép requests không có origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ===== BẢO MẬT (SECURITY MIDDLEWARES) =====
// 1. Set security HTTP headers
app.use(helmet());

// (Lưu ý: express-mongo-sanitize và xss-clean bị loại bỏ do không tương thích Express 5)

// 2. Rate limiting (Toàn cục)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: process.env.NODE_ENV === 'development' ? 2000 : 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
  message: 'Quá nhiều yêu cầu từ IP của bạn, vui lòng thử lại sau 15 phút.',
  standardHeaders: true, 
  legacyHeaders: false,
});
app.use('/api', limiter);

// 5. Rate limiting chặt chẽ hơn cho Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, // 10 attempts per 15 minutes for auth endpoints
  message: 'Quá nhiều yêu cầu đăng nhập/quên mật khẩu, vui lòng thử lại sau.',
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
// ==========================================

const seedAdmin = async () => {
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');
  try {
    const adminExists = await User.findOne({ email: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || '123456', salt);
      await User.create({
        fullName: 'Quản trị viên',
        email: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Đã tạo tài khoản admin mặc định (TK: admin, MK: 123456)');
    }
  } catch (err) {
    console.error('❌ Lỗi tạo admin:', err);
  }
};

const seedServices = async () => {
  const Service = require('./models/Service');
  try {
    const count = await Service.countDocuments();
    if (count === 0) {
      const defaultServices = [
        // MEDICAL
        { name: 'Khám Tổng Quát', emoji: '🩺', category: 'Medical', basePrice: 200000, estimatedDuration: 45, requiresOnsite: false, homeServiceAvailable: true, description: 'Kiểm tra sức khỏe tổng quát định kỳ' },
        { name: 'Tiêm phòng vắc xin', emoji: '💉', category: 'Medical', basePrice: 250000, estimatedDuration: 30, requiresOnsite: false, homeServiceAvailable: true, description: 'Tiêm phòng định kỳ, giữ an toàn cho thú cưng' },
        { name: 'Xét nghiệm máu', emoji: '🧪', category: 'Medical', basePrice: 350000, estimatedDuration: 60, requiresOnsite: true, homeServiceAvailable: false, description: 'Xét nghiệm tổng quát, kiểm tra nội tạng' },
        { name: 'Siêu âm', emoji: '🔍', category: 'Medical', basePrice: 400000, estimatedDuration: 45, requiresOnsite: true, homeServiceAvailable: false, description: 'Chẩn đoán hình ảnh, phát hiện bất thường' },
        { name: 'Phẫu thuật (báo giá lại sau)', emoji: '⚔️', category: 'Medical', basePrice: 1500000, estimatedDuration: 180, requiresOnsite: true, homeServiceAvailable: false, description: 'Can thiệp ngoại khoa — giá cuối sẽ báo sau khám' },
        // GROOMING
        { name: 'Tắm & Sấy khô', emoji: '🛁', category: 'Grooming', basePrice: 150000, estimatedDuration: 60, requiresOnsite: true, homeServiceAvailable: false, description: 'Tắm sạch, sấy khô thơm' },
        { name: 'Cắt tỉa lông & tạo kiểu', emoji: '✂️', category: 'Grooming', basePrice: 300000, estimatedDuration: 90, requiresOnsite: true, homeServiceAvailable: false, description: 'Cắt tỉa lông chuyên nghiệp theo yêu cầu' },
        { name: 'Vệ sinh tai & móng', emoji: '🐾', category: 'Grooming', basePrice: 100000, estimatedDuration: 30, requiresOnsite: true, homeServiceAvailable: false, description: 'Vệ sinh tai, cắt móng an toàn' },
        { name: 'Combo Spa Cao Cấp', emoji: '✨', category: 'Grooming', basePrice: 500000, estimatedDuration: 150, requiresOnsite: true, homeServiceAvailable: false, description: 'Tắm + Cắt lông + Vệ sinh + Nước hoa cao cấp' },
        // HOME SERVICE
        { name: 'Khám & Chăm sóc tại nhà', emoji: '🏠', category: 'HomeService', basePrice: 300000, estimatedDuration: 60, requiresOnsite: false, homeServiceAvailable: true, description: 'Bác sĩ đến tận nơi khám cho thú cưng' },
        // HOTEL
        { name: 'Lưu trú qua đêm', emoji: '🏨', category: 'Hotel', basePrice: 200000, estimatedDuration: 1440, requiresOnsite: true, homeServiceAvailable: false, description: 'Giữ thú cưng qua đêm tại phòng khám' },
      ];
      await Service.insertMany(defaultServices);
      console.log('✅ Đã tạo 11 dịch vụ mặc định');
    }
  } catch (err) {
    console.error('❌ Lỗi tạo dịch vụ:', err);
  }
};

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Đã kết nối MongoDB Atlas');
    seedAdmin();
    seedServices();
  })
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

const medicalRecordRoutes = require('./routes/medicalRecordRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/staffs', staffRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/vaccinations', vaccinationRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'KT Pet Clinic API đang chạy 🐾' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint không tồn tại' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Lỗi server nội bộ' });
});

// Background Job: Auto-cancel pending appointments after 30 minutes
const cleanupPendingAppointments = async () => {
  try {
    const Appointment = require('./models/Appointment');
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const result = await Appointment.updateMany(
      {
        status: 'pending',
        paymentStatus: 'Pending',
        createdAt: { $lt: thirtyMinsAgo }
      },
      {
        $set: {
          status: 'cancelled',
          clinicNote: 'Hệ thống tự động hủy do quá hạn chờ thanh toán (30 phút).'
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`[Auto-Cleanup] Đã tự động hủy ${result.modifiedCount} lịch hẹn quá hạn thanh toán.`);
    }
  } catch (error) {
    console.error('[Auto-Cleanup Error]', error);
  }
};
setInterval(cleanupPendingAppointments, 60 * 1000);

// Initialize Reminder Service (Cron jobs)
require('./utils/reminderService')(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server đang chạy tại port ${PORT}`));
