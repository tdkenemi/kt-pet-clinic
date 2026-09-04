const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

module.exports = (io) => {
  // Config Nodemailer (Sử dụng Gmail hoặc Ethereal để test)
  // Trong thực tế, thay bằng cấu hình thật. Vì là đồ án, ta có thể dùng biến môi trường
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'test@gmail.com',
      pass: process.env.EMAIL_PASS || 'password'
    }
  });

  // Chạy mỗi ngày lúc 08:00 sáng
  cron.schedule('0 8 * * *', async () => {
    console.log('[Reminder Service] Bắt đầu quét lịch hẹn ngày mai...');
    try {
      const tomorrowStart = new Date();
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      tomorrowStart.setHours(0, 0, 0, 0);
      
      const tomorrowEnd = new Date(tomorrowStart);
      tomorrowEnd.setHours(23, 59, 59, 999);

      // Chuyển format YYYY-MM-DD để query (vì Appointment lưu dạng string "YYYY-MM-DD")
      const dateString = tomorrowStart.toISOString().split('T')[0];

      const appointments = await Appointment.find({
        date: dateString,
        status: { $in: ['pending', 'confirmed'] }
      }).populate('userId', 'email fullName').populate('petId', 'name');

      console.log(`[Reminder Service] Tìm thấy ${appointments.length} lịch hẹn.`);

      for (const apt of appointments) {
        if (!apt.userId || !apt.userId.email) continue;

        // 1. Gửi Email (Bỏ qua lỗi nếu cấu hình email chưa đúng để tránh chết process)
        try {
          await transporter.sendMail({
            from: `"KT Pet Clinic 🐾" <${process.env.EMAIL_USER}>`,
            to: apt.userId.email,
            subject: '🐾 Nhắc lịch khám thú cưng ngày mai',
            html: `
              <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                    <span style="font-size: 28px;">📅</span>
                  </div>
                  <h2 style="color: #0f172a; font-size: 22px; margin: 0;">KT Pet Clinic</h2>
                </div>
                <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                  <p style="color: #475569; margin: 0 0 16px; font-size: 16px;">Xin chào <strong>${apt.userId.fullName}</strong>,</p>
                  <p style="color: #475569; margin: 0 0 20px; line-height: 1.5;">Phòng khám xin trân trọng nhắc bạn về lịch khám cho bé <strong>${apt.petId.name}</strong> vào ngày mai.</p>
                  
                  <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 100px;">Ngày khám:</td>
                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${apt.date}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Khung giờ:</td>
                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${apt.timeSlot}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">Vui lòng đến đúng giờ để bé được phục vụ tốt nhất. Nếu cần thay đổi, hãy liên hệ Hotline của chúng tôi.</p>
                </div>
                <p style="color: #cbd5e1; font-size: 12px; text-align: center; margin-top: 16px;">© 2026 KT Pet Clinic 🐾</p>
              </div>
            `
          });
        } catch (mailErr) {
          console.log(`[Reminder Service] Lỗi gửi email đến ${apt.userId.email} (Có thể chưa cấu hình SMTP)`);
        }

        // 2. Gửi In-app Notification + Socket
        const notif = await Notification.create({
          userId: apt.userId._id,
          title: 'Nhắc lịch khám ngày mai',
          message: `Lịch khám cho bé ${apt.petId.name} vào lúc ${apt.timeSlot} ngày mai.`,
          type: 'appointment',
          relatedId: apt._id,
          read: false
        });

        io.to(apt.userId._id.toString()).emit('receive_notification', notif);
      }
    } catch (error) {
      console.error('[Reminder Service] Lỗi:', error);
    }
  });

  console.log('✅ Đã khởi tạo Reminder Service (Cron jobs)');
};
