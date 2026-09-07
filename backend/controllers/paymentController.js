const { buildVietQRUrl } = require('../utils/pricing');
const Appointment = require('../models/Appointment');
const PaymentTransaction = require('../models/PaymentTransaction');
const { sendAppointmentReceiptEmail } = require('../utils/emailService');

// Thông tin ngân hàng phòng khám (có thể đưa vào .env)
const BANK_CONFIG = {
  bankId: process.env.BANK_ID || 'VCB',           // Mã ngân hàng (VCB = Vietcombank)
  accountNo: process.env.BANK_ACCOUNT || '1234567890', // Số tài khoản
  accountName: process.env.BANK_NAME || 'PHONG KHAM THU CUNG',
};

/**
 * GET /api/payments/qr/:appointmentId
 * Tạo QR thanh toán VietQR cho lịch hẹn
 */
exports.getQRCode = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('petId', 'name')
      .populate('userId', 'fullName');

    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Chỉ cho phép user chủ lịch hẹn hoặc admin
    if (
      appointment.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const amount = appointment.totalPrice || appointment.billingDetails?.price || appointment.estimatedPrice || 0;

    if (amount === 0) {
      return res.status(400).json({ message: 'Lịch hẹn chưa có thông tin giá. Vui lòng chờ Admin xác nhận.' });
    }

    // Nội dung thanh toán: DH + 6 ký tự cuối của ID (ngắn gọn, dễ nhận dạng)
    const shortId = appointment._id.toString().slice(-8).toUpperCase();
    const addInfo = `KHOAM${shortId}`;

    const qrUrl = buildVietQRUrl({
      ...BANK_CONFIG,
      amount,
      addInfo, // Nội dung tự điền vào app ngân hàng khi quét QR
    });

    res.json({
      qrUrl,
      bankId: BANK_CONFIG.bankId,
      accountNo: BANK_CONFIG.accountNo,
      accountName: BANK_CONFIG.accountName,
      amount,
      content: addInfo,
      appointmentId: appointment._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo mã QR', error: error.message });
  }
};

/**
 * PATCH /api/payments/:appointmentId/pay
 * User xác nhận đã thanh toán (QR/Bank) hoặc Admin xác nhận tiền mặt
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Chỉ Admin mới được dùng endpoint này (đã được route chặn bởi middleware `admin`)
    const allowedMethods = ['Cash', 'QR', 'BankTransfer', 'Visa'];

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ' });
    }

    appointment.paymentMethod = paymentMethod;
    appointment.paymentStatus = 'Paid';
    appointment.paidAt = new Date();

    await appointment.save();

    // Gửi email biên lai
    await appointment.populate('userId', 'email fullName');
    await appointment.populate('petId', 'name');
    await appointment.populate('vetId', 'fullName phone');
    if (appointment.userId && appointment.userId.email) {
      await sendAppointmentReceiptEmail(appointment.userId.email, appointment);
    }

    res.json({ message: 'Đã ghi nhận thanh toán thành công', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xác nhận thanh toán', error: error.message });
  }
};

/**
 * POST /api/payments/webhook
 * VietQR Webhook Listener (Nhận callback từ VietQR / casso.vn)
 * 
 * HƯỚNG DẪN NGROK CHO DEMO:
 * 1. Tải ngrok: https://ngrok.com/download
 * 2. Chạy: ngrok http 5000
 * 3. Copy URL https://xxxx.ngrok-free.app
 * 4. Cấu hình webhook URL tại casso.vn hoặc VietQR:
 *    https://xxxx.ngrok-free.app/api/payments/webhook
 * 5. Khi user quét QR và thanh toán → webhook tự động gọi → cập nhật DB
 */
exports.vietqrWebhook = async (req, res) => {
  try {
    // [SECURITY C-02] Xác thực Secure Token từ Casso/VietQR
    // Cấu hình tại: casso.vn → Cài đặt → API → Secure Token
    const cassoSecureToken = process.env.CASSO_SECURE_TOKEN;
    if (cassoSecureToken) {
      const incomingToken = req.headers['secure-token'] || req.headers['authorization'];
      if (!incomingToken || incomingToken !== cassoSecureToken) {
        console.warn(`[Webhook] REJECTED - Invalid or missing secure token from IP: ${req.ip}`);
        return res.status(401).json({ message: 'Unauthorized webhook request' });
      }
    } else if (process.env.NODE_ENV === 'production') {
      // Production bắt buộc phải có token, không có thì reject tất cả
      console.error('[Webhook] CASSO_SECURE_TOKEN chưa được cấu hình trong .env!');
      return res.status(503).json({ message: 'Webhook not configured' });
    }

    const payload = req.body;
    
    // Hỗ trợ format từ casso.vn và VietQR
    // Casso format: { error: 0, data: [{ description: "...", amount: ... }] }
    // VietQR format tương tự
    if (!payload || payload.error !== 0 || !payload.data || payload.data.length === 0) {
      return res.status(400).json({ message: 'Invalid Payload' });
    }

    const tx = payload.data[0];
    const description = (tx.description || tx.content || '').toUpperCase();
    
    // Tìm mã KHOAM + 8 ký tự
    const match = description.match(/KHOAM([A-Z0-9]{8})/i);
    if (!match) {
      // Thử format cũ DH + ID
      const oldMatch = description.match(/DH([a-f0-9]{24})/i);
      if (oldMatch) {
        const appointment = await Appointment.findById(oldMatch[1]);
        if (appointment && appointment.paymentStatus !== 'Paid') {
          appointment.paymentStatus = 'Paid';
          appointment.paymentMethod = 'QR';
          appointment.paidAt = new Date();
          await appointment.save();

          await appointment.populate('userId', 'email fullName');
          await appointment.populate('petId', 'name');
          await appointment.populate('vetId', 'fullName phone');
          if (appointment.userId && appointment.userId.email) {
            await sendAppointmentReceiptEmail(appointment.userId.email, appointment);
          }

          console.log(`[Webhook] Thanh toán QR (format cũ): ${oldMatch[1]}`);
        }
      }
      return res.status(200).json({ message: 'Processed or not an appointment payment' });
    }

    const shortId = match[1].toLowerCase();
    
    // Tìm tất cả lịch hẹn chưa thanh toán và lọc bằng Node.js (vì $where không nhận biến closure)
    const pendingAppointments = await Appointment.find({ paymentStatus: { $ne: 'Paid' } });
    const appointment = pendingAppointments.find(a => 
      a._id.toString().slice(-8).toLowerCase() === shortId
    );

    if (!appointment) {
      return res.status(200).json({ message: 'Appointment not found by shortId' });
    }

    if (appointment.paymentStatus === 'Paid') {
      return res.status(200).json({ message: 'Already paid' });
    }

    // Check if this transaction has already been processed (Idempotency check)
    const providerTxId = tx.id || tx.reference || tx.tid || Date.now().toString();
    const existingTx = await PaymentTransaction.findOne({ providerTransactionId: providerTxId });
    
    if (!existingTx) {
      await PaymentTransaction.create({
        appointmentId: appointment._id,
        amount: tx.amount,
        transferDescription: description,
        status: 'PAID',
        providerTransactionId: providerTxId,
        paidAt: new Date()
      });
    }

    appointment.paymentStatus = 'Paid';
    appointment.paymentMethod = 'QR';
    appointment.paidAt = new Date();
    await appointment.save();

    await appointment.populate('userId', 'email fullName');
    await appointment.populate('petId', 'name');
    await appointment.populate('vetId', 'fullName phone');
    if (appointment.userId && appointment.userId.email) {
      await sendAppointmentReceiptEmail(appointment.userId.email, appointment);
    }

    console.log(`[Webhook] ✅ Thanh toán QR thành công: ${appointment._id} — ${tx.amount}đ`);
    return res.status(200).json({ success: true, message: 'Payment confirmed via webhook' });
  } catch (error) {
    console.error('[Webhook Error]', error);
    res.status(500).json({ message: 'Internal Webhook Error' });
  }
};

/**
 * PATCH /api/payments/:appointmentId/refund
 * Admin xác nhận đã hoàn tiền cho khách hàng
 */
exports.processRefund = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

    if (appointment.paymentStatus !== 'RefundPending') {
      return res.status(400).json({ message: 'Lịch hẹn không ở trạng thái chờ hoàn tiền' });
    }

    appointment.paymentStatus = 'Refunded';
    await appointment.save();

    res.json({ message: 'Đã xác nhận hoàn tiền thành công', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * POST /api/payments/mock-webhook
 * Bắn webhook giả lập để test QR thanh toán
 */
exports.mockWebhook = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) return res.status(400).json({ message: 'Thiếu appointmentId' });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

    // Tạo payload giả mạo Casso/VietQR
    const shortId = appointment._id.toString().slice(-8).toUpperCase();
    const mockPayload = {
      error: 0,
      data: [{
        description: `KHOAM${shortId} CHUYEN KHOAN TEST`,
        amount: appointment.totalPrice || appointment.estimatedPrice || 0
      }]
    };

    // Gọi trực tiếp webhook handler
    const mockReq = { body: mockPayload };
    const mockRes = {
      status: () => ({ json: (data) => data }) // Mock res chain
    };

    // Tái sử dụng logic webhook chính
    await exports.vietqrWebhook(mockReq, mockRes);
    
    // Fetch lại appointment để trả về FE
    const updated = await Appointment.findById(appointmentId);

    res.json({ message: 'Webhook giả lập đã chạy thành công!', appointment: updated });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi giả lập', error: error.message });
  }
};

/**
 * GET /api/payments/transactions
 * Lấy lịch sử giao dịch (Admin)
 */
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await PaymentTransaction.find({})
      .populate({
        path: 'appointmentId',
        select: 'userId petId service totalPrice estimatedPrice billingDetails',
        populate: [
          { path: 'userId', select: 'fullName phone' },
          { path: 'petId', select: 'name species' }
        ]
      })
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * Helper: Sắp xếp tham số cho VNPay
 */
function sortObject(obj) {
  const sorted = {};
  const str = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (let key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

function formatVNPayDate(date) {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}

/**
 * POST /api/payments/vnpay/create-url
 * Tạo URL thanh toán VNPay Sandbox
 */
exports.createVNPayUrl = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.status(400).json({ message: 'Thiếu appointmentId' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Quyền truy cập
    if (
      appointment.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Không có quyền truy cập lịch hẹn này' });
    }

    const amount = appointment.totalPrice || appointment.billingDetails?.price || appointment.estimatedPrice || 0;
    if (amount <= 0) {
      return res.status(400).json({ message: 'Số tiền không hợp lệ để thanh toán VNPay' });
    }

    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    const vnpUrl = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const returnUrl = process.env.VNP_RETURN_URL || 'http://localhost:5173/payment-return';

    if (!tmnCode || !secretKey) {
      return res.status(500).json({ message: 'Chưa cấu hình thông tin VNPay trong biến môi trường (.env)' });
    }

    const dayjs = require('dayjs');
    const utc = require('dayjs/plugin/utc');
    const timezone = require('dayjs/plugin/timezone');
    dayjs.extend(utc);
    dayjs.extend(timezone);

    const now = dayjs().tz('Asia/Ho_Chi_Minh');
    const createDate = now.format('YYYYMMDDHHmmss');
    const expireDate = now.add(15, 'minute').format('YYYYMMDDHHmmss');

    const orderId = `${appointment._id.toString()}_${Date.now()}`;
    let ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    ipAddr = ipAddr.split(',')[0].trim();
    if (ipAddr === '::1' || !ipAddr.includes('.')) {
      ipAddr = '127.0.0.1';
    }

    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan lich hen KT Clinic ${appointment._id.toString().slice(-6)}`,
      vnp_OrderType: 'other',
      vnp_Amount: Math.round(amount) * 100, // VNPay yêu cầu nhân 100 và phải là số nguyên
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate
    };

    console.log('[VNPay] Params generated:', vnp_Params);

    vnp_Params = sortObject(vnp_Params);

    const signData = Object.keys(vnp_Params)
      .map(key => `${key}=${vnp_Params[key]}`)
      .join('&');
      
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = signed;
    
    const paymentUrl = `${vnpUrl}?${Object.keys(vnp_Params).map(key => `${key}=${vnp_Params[key]}`).join('&')}`;

    res.json({ success: true, paymentUrl });
  } catch (error) {
    console.error('Lỗi tạo URL VNPay:', error);
    res.status(500).json({ message: 'Lỗi tạo liên kết thanh toán VNPay', error: error.message });
  }
};

/**
 * GET /api/payments/vnpay/verify-return
 * Xác thực dữ liệu khi VNPay redirect về
 */
exports.verifyVNPayReturn = async (req, res) => {
  try {
    let vnp_Params = { ...req.query };
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNP_HASH_SECRET;
    if (!secretKey) {
      return res.status(500).json({ message: 'Chưa cấu hình VNP_HASH_SECRET trong biến môi trường (.env)' });
    }
    
    const signData = Object.keys(vnp_Params)
      .map(key => `${key}=${vnp_Params[key]}`)
      .join('&');
      
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash !== signed) {
      return res.status(400).json({ success: false, message: 'Chữ ký không hợp lệ (Sai checksum)' });
    }

    const responseCode = vnp_Params['vnp_ResponseCode'];
    const txnRef = vnp_Params['vnp_TxnRef'];
    const appointmentId = txnRef.split('_')[0];

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch hẹn' });
    }

    if (responseCode === '00') {
      // Thanh toán thành công
      if (appointment.paymentStatus !== 'Paid') {
        appointment.paymentStatus = 'Paid';
        appointment.paymentMethod = 'VNPay';
        appointment.paidAt = new Date();
        await appointment.save();

        // Ghi lại transaction
        const amount = Number(vnp_Params['vnp_Amount']) / 100;
        await PaymentTransaction.create({
          appointmentId: appointment._id,
          amount: amount,
          transferDescription: `VNPay: ${vnp_Params['vnp_OrderInfo']}`,
          status: 'PAID',
          providerTransactionId: vnp_Params['vnp_TransactionNo'] || vnp_Params['vnp_BankTranNo'] || txnRef,
          paidAt: new Date()
        });

        await appointment.populate('userId', 'email fullName');
        await appointment.populate('petId', 'name');
        await appointment.populate('vetId', 'fullName phone');
        if (appointment.userId && appointment.userId.email) {
          await sendAppointmentReceiptEmail(appointment.userId.email, appointment);
        }
      }

      return res.json({
        success: true,
        message: 'Thanh toán qua VNPay thành công!',
        appointmentId: appointment._id,
        amount: Number(vnp_Params['vnp_Amount']) / 100,
        bankCode: vnp_Params['vnp_BankCode'],
        transactionNo: vnp_Params['vnp_TransactionNo']
      });
    } else {
      return res.json({
        success: false,
        message: 'Giao dịch không thành công hoặc đã bị hủy từ phía khách hàng',
        responseCode
      });
    }
  } catch (error) {
    console.error('Lỗi xác thực VNPay:', error);
    res.status(500).json({ success: false, message: 'Lỗi xác thực giao dịch', error: error.message });
  }
};

