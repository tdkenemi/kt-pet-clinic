/**
 * Tính giá ước tính cho một lịch hẹn
 * @param {Object} service - Service document từ DB
 * @param {Number} travelFee - Phí di chuyển (nếu dịch vụ tại nhà)
 * @returns {Number} totalEstimate
 */
const calculateEstimatedPrice = (service, travelFee = 0) => {
  const basePrice = service?.basePrice || 0;
  return basePrice + travelFee;
};

/**
 * Format số tiền sang VNĐ
 */
const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

/**
 * Tạo VietQR URL
 * @param {string} addInfo - Nội dung chuyển khoản (tự điền vào app ngân hàng khi quét)
 */
const buildVietQRUrl = ({ bankId, accountNo, accountName, amount, addInfo }) => {
  const info = encodeURIComponent(addInfo || '');
  const name = encodeURIComponent(accountName);
  // compact2 = QR nhỏ gọn, đẹp hơn cho mobile
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${info}&accountName=${name}`;
};

module.exports = { calculateEstimatedPrice, formatVND, buildVietQRUrl };
