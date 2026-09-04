const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

exports.sendAppointmentReceiptEmail = async (userEmail, appointment) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[EmailService] Bỏ qua gửi email vì chưa cấu hình Gmail SMTP.');
    return false;
  }

  try {
    const transporter = createTransporter();
    
    let servicesList = appointment.services.map(s => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px dashed #e2e8f0; color: #334155; font-size: 14px;">
          ${s.name}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px dashed #e2e8f0; color: #0f172a; font-size: 14px; text-align: right; font-weight: 600;">
          ${formatCurrency(s.price || 0)}
        </td>
      </tr>
    `).join('');

    if (appointment.serviceLocation === 'home' && appointment.travelFee > 0) {
      servicesList += `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px dashed #e2e8f0; color: #334155; font-size: 14px; font-style: italic;">
            Phí di chuyển (Khám tại nhà)
          </td>
          <td style="padding: 12px 0; border-bottom: 1px dashed #e2e8f0; color: #0f172a; font-size: 14px; text-align: right; font-weight: 600;">
            ${formatCurrency(appointment.travelFee)}
          </td>
        </tr>
      `;
    }

    const totalAmount = appointment.totalPrice || appointment.billingDetails?.price || appointment.estimatedPrice || 0;
    const paymentMethodText = appointment.paymentMethod === 'Cash' ? 'Tiền mặt tại quầy' : (appointment.paymentMethod || 'Chưa chọn');
    
    // Xử lý địa chỉ
    const addressLabel = appointment.serviceLocation === 'home' ? 'Địa chỉ khách hàng:' : 'Địa chỉ phòng khám:';
    const addressValue = appointment.serviceLocation === 'home' 
      ? (appointment.homeAddress || 'Chưa cung cấp') 
      : (appointment.billingDetails?.clinicAddress || '123 Đường ABC, Quận X, TP.HCM');

    // Xử lý Bác sĩ
    const vetName = appointment.vetId?.fullName || appointment.billingDetails?.vetName || 'Sẽ được phân công';
    const vetPhone = appointment.vetId?.phone || appointment.billingDetails?.vetPhone || 'Chưa có thông tin';
    
    const htmlContent = `
      <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0d9488, #0f766e); padding: 32px 24px; text-align: center;">
            <div style="width: 64px; height: 64px; background-color: #ffffff; border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; line-height: 64px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              🐾
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">KT Pet Clinic</h1>
            <p style="color: #ccfbf1; margin: 8px 0 0 0; font-size: 15px;">Phiếu Đặt Lịch & Thanh Toán</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px 24px;">
            <p style="color: #475569; font-size: 16px; line-height: 24px; margin-top: 0;">
              Xin chào <strong style="color: #0f172a;">${appointment.userId?.fullName || 'Quý khách'}</strong>,
            </p>
            <p style="color: #475569; font-size: 15px; line-height: 24px;">
              Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ tại KT Pet Clinic. Dưới đây là thông tin chi tiết về lịch hẹn của thú cưng <strong style="color: #0d9488;">${appointment.petId?.name || ''}</strong>.
            </p>

            <!-- Info Card -->
            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 40%;">Mã lịch hẹn:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">#${appointment._id.toString().slice(-8).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Thời gian:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${appointment.timeSlot} | ${appointment.date}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Hình thức:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${appointment.serviceLocation === 'home' ? 'Khám tại nhà' : 'Khám tại phòng khám'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">${addressLabel}</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${addressValue}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px; border-top: 1px dashed #cbd5e1; padding-top: 12px; margin-top: 4px;">Bác sĩ phụ trách:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right; border-top: 1px dashed #cbd5e1; padding-top: 12px; margin-top: 4px;">${vetName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">SĐT Bác sĩ:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${vetPhone}</td>
                </tr>
              </table>
            </div>

            <h3 style="color: #0f172a; font-size: 16px; font-weight: 700; margin: 0 0 16px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Chi tiết chi phí</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              ${servicesList}
            </table>

            <!-- Total -->
            <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; padding: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #0f766e; font-size: 16px; font-weight: 600;">Tổng thanh toán</td>
                  <td style="color: #0d9488; font-size: 20px; font-weight: 700; text-align: right;">${formatCurrency(totalAmount)}</td>
                </tr>
              </table>
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #99f6e4; text-align: center;">
                <span style="display: inline-block; background-color: ${appointment.paymentStatus === 'Paid' ? '#dcfce7' : '#fef3c7'}; color: ${appointment.paymentStatus === 'Paid' ? '#166534' : '#92400e'}; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600;">
                  ${appointment.paymentStatus === 'Paid' ? '✅ Đã thanh toán' : '⏳ Chờ thanh toán'} (${paymentMethodText})
                </span>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">Mọi thắc mắc xin vui lòng liên hệ:</p>
            <p style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0;">Hotline: 0123 456 789 | Email: support@ktpetclinic.com</p>
            <p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0 0;">© 2026 KT Pet Clinic. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"KT Pet Clinic 🐾" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: `Phiếu Đặt Lịch & Thanh Toán - KT Pet Clinic (#${appointment._id.toString().slice(-6).toUpperCase()})`,
      html: htmlContent,
    });

    console.log(`[EmailService] Đã gửi receipt đến ${userEmail}`);
    return true;
  } catch (error) {
    console.error('[EmailService] Lỗi gửi email receipt:', error.message);
    return false;
  }
};
