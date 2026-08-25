# TÀI LIỆU TÍCH HỢP THANH TOÁN VIETQR - KT PET CLINIC

Tài liệu này mô tả chi tiết hệ thống thanh toán tự động được triển khai trong đồ án.

## 1. Kiến trúc Hệ thống (Architecture)
Hệ thống sử dụng mô hình **Webhook (IPN - Instant Payment Notification)** để xác nhận giao dịch tự động từ ngân hàng.

- **Frontend:** React.js, Tailwind CSS, Lucide Icons.
- **Backend:** Node.js, Express, MongoDB.
- **Payment Gateway:** VietQR (Chuẩn NAPAS 247).
- **Automation Provider:** Casso.vn / SePay.vn (Trung gian lấy biến động số dư).

## 2. Luồng thanh toán (Payment Flow)
1. **User:** Đặt lịch khám thú cưng.
2. **Admin:** Duyệt lịch và nhập giá tiền thực tế (Billing).
3. **User:** Vào chi tiết lịch hẹn, hệ thống tự sinh mã VietQR động chứa:
   - Số tài khoản & Ngân hàng của phòng khám.
   - Số tiền chính xác của lịch hẹn.
   - Nội dung chuyển khoản định dạng: `KHOAM[ID_8_KY_TU]`.
4. **Ngân hàng:** Khi User chuyển khoản thành công, ngân hàng gửi thông báo đến dịch vụ trung gian.
5. **Webhook:** Dịch vụ trung gian gọi API `POST /api/payments/webhook` của hệ thống.
6. **Backend:** 
   - Kiểm tra mã `KHOAM...` trong nội dung chuyển khoản.
   - So khớp số tiền.
   - Cập nhật trạng thái `PaymentStatus = Paid` và `Status = Confirmed`.
7. **Frontend:** User thấy màn hình tự động chuyển sang "Đã thanh toán" (Real-time).

## 3. Các tính năng bảo mật & Chống gian lận
- **Validate Số tiền:** Chỉ đánh dấu thành công nếu số tiền thực nhận khớp với giá trị trong DB.
- **Idempotency:** Ngăn chặn việc xử lý trùng lặp nếu Webhook gửi lại nhiều lần.
- **Phân quyền (RBAC):** Chỉ Admin mới có quyền truy cập các API giả lập và xác nhận thủ công.
- **Environment Variables:** Thông tin ngân hàng và Secret Key được lưu trong file `.env`.

## 4. Hướng dẫn Demo (Giả lập)
Do tính chất đồ án, hệ thống hỗ trợ công cụ **Mock Webhook** trong phần **Admin -> Cài đặt**:
1. Copy ID lịch hẹn.
2. Dán vào công cụ giả lập và chạy.
3. Hệ thống sẽ mô phỏng tín hiệu từ ngân hàng gửi về để cập nhật trạng thái thanh toán.

## 5. Biến môi trường (.env)
```env
# Thông tin QR thanh toán ngân hàng
BANK_ID=VCB
BANK_ACCOUNT=1234567890
BANK_NAME=PHONG KHAM THU CUNG KT
```

---
*Tài liệu được chuẩn bị cho Hội đồng Bảo vệ Đồ án Chuyên ngành.*
