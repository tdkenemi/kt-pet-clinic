const express = require('express');
const router = express.Router();
const { 
  getQRCode, 
  confirmPayment, 
  vietqrWebhook, 
  processRefund, 
  mockWebhook, 
  getAllTransactions,
  createVNPayUrl,
  verifyVNPayReturn
} = require('../controllers/paymentController');
const { protect, admin } = require('../middlewares/authMiddleware');

// POST /api/payments/webhook — Nhận VietQR IPN (Không cần protect vì VietQR gọi)
router.post('/webhook', vietqrWebhook);

// GET /api/payments/transactions — Lấy danh sách giao dịch (Chỉ Admin)
router.get('/transactions', protect, admin, getAllTransactions);

// GET  /api/payments/qr/:appointmentId  — Lấy QR code thanh toán
router.get('/qr/:appointmentId', protect, getQRCode);

// POST /api/payments/vnpay/create-url — Tạo liên kết thanh toán VNPay Sandbox
router.post('/vnpay/create-url', protect, createVNPayUrl);

// GET /api/payments/vnpay/verify-return — Xác thực kết quả VNPay trả về
router.get('/vnpay/verify-return', verifyVNPayReturn);

// PATCH /api/payments/:appointmentId/pay — Xác nhận đã thanh toán (Chỉ Admin)
router.patch('/:appointmentId/pay', protect, admin, confirmPayment);

// PATCH /api/payments/:appointmentId/refund — Đánh dấu đã hoàn tiền (Chỉ Admin)
router.patch('/:appointmentId/refund', protect, admin, processRefund);

// POST /api/payments/mock-webhook — Giả lập webhook (Chỉ Admin / Test)
router.post('/mock-webhook', protect, admin, mockWebhook);

module.exports = router;

