exports.askChatbot = async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ message: 'Vui lòng nhập câu hỏi.' });
  }

  const q = question.toLowerCase();
  let answer = '';

  // Nhận diện từ khóa (Rule-based Logic)
  if (q.includes('giờ làm việc') || q.includes('mở cửa') || q.includes('đóng cửa') || q.includes('thời gian')) {
    answer = `⏰ **Giờ làm việc của KT Pet Clinic:**\n\n• **Thứ 2 - Thứ 6:** 08:00 - 20:00\n• **Thứ 7 - Chủ Nhật:** 08:00 - 18:00\n• **Cấp cứu 24/7:** Phục vụ xuyên đêm (vui lòng gọi Hotline).\n\nBạn có muốn đặt lịch khám không?`;
  } else if (q.includes('dịch vụ') || q.includes('có những gì') || q.includes('bao nhiêu dịch vụ') || q.includes('bảng giá')) {
    answer = `🏥 **KT Pet Clinic hiện đang cung cấp 11 dịch vụ chất lượng cao:**\n\n1. **Khám bệnh:** Tổng quát, Xét nghiệm máu, Siêu âm.\n2. **Phòng bệnh:** Tiêm phòng vắc xin.\n3. **Làm đẹp (Grooming):** Tắm sấy, Cắt tỉa lông, Vệ sinh tai móng, Spa cao cấp.\n4. **Tiện ích:** Khám tại nhà, Lưu trú qua đêm (Hotel).\n5. **Đặc biệt:** Phẫu thuật ngoại khoa và Cấp cứu 24/7.\n\nBạn quan tâm đến dịch vụ nào để tôi tư vấn chi tiết hơn?`;
  } else if (q.includes('đặt lịch') || q.includes('hẹn') || q.includes('đăng ký')) {
    answer = `📅 **Hướng dẫn đặt lịch khám:**\n\nBạn có thể dễ dàng đặt lịch bằng cách bấm vào menu **"Đặt lịch"** ở thanh điều hướng phía trên.\nQuy trình chỉ gồm 5 bước nhanh chóng:\n1. Chọn thú cưng\n2. Chọn dịch vụ\n3. Chọn ngày & Bác sĩ\n4. Chọn phương thức (Tại nhà/Phòng khám)\n5. Thanh toán.\n\nHoặc nếu bạn cần gấp, hãy gọi **0901 234 567**.`;
  } else if (q.includes('tiêm phòng') || q.includes('vaccine') || q.includes('vắc xin')) {
    answer = `💉 **Dịch vụ tiêm phòng:**\n\nKT Pet Clinic cung cấp các mũi tiêm phòng định kỳ cho Chó và Mèo (5 bệnh, 7 bệnh, dại...) với giá cơ bản từ **250.000đ/mũi**. Hệ thống sẽ tự động cấp **Sổ tiêm phòng điện tử** và nhắc lịch tiêm mũi tiếp theo qua Email.\n\nBạn muốn tiêm phòng cho chó hay mèo?`;
  } else if (q.includes('cấp cứu') || q.includes('khẩn cấp') || q.includes('nguy hiểm')) {
    answer = `🚑 **Dịch vụ Cấp Cứu 24/7:**\n\nNếu thú cưng đang trong tình trạng nguy hiểm, vui lòng **GỌI NGAY HOTLINE: 0901 234 567** để được hỗ trợ tức thì. Đội ngũ bác sĩ cấp cứu của chúng tôi luôn túc trực 24/24 kể cả ngày lễ.`;
  } else if (q.includes('địa chỉ') || q.includes('ở đâu') || q.includes('đường nào') || q.includes('vị trí')) {
    answer = `📍 **Địa chỉ phòng khám:**\n\nKT Pet Clinic tọa lạc tại:\n**123 Đường Thú Cưng, Quận 1, TP. Hồ Chí Minh**.\n\nBạn có thể xem bản đồ chỉ đường chi tiết ở phần trang chủ hoặc phần cuối trang web (Footer).`;
  } else if (q.includes('xin chào') || q.includes('hello') || q.includes('hi') || q.includes('chào')) {
    answer = `👋 Chào bạn! Cảm ơn bạn đã ghé thăm KT Pet Clinic. Tôi là Trợ lý tự động. Bạn cần tìm hiểu thông tin về Giờ làm việc, Dịch vụ hay Đặt lịch khám?`;
  } else if (q.includes('cảm ơn') || q.includes('thanks') || q.includes('ok') || q.includes('dạ')) {
    answer = `❤️ Không có gì ạ! Chúc bé cưng của bạn luôn khỏe mạnh. Nếu cần thêm hỗ trợ, đừng ngại hỏi tôi nhé.`;
  } else {
    answer = `🤔 Xin lỗi, tôi chỉ là **Trợ lý Tự Động** nên chưa được lập trình để hiểu câu hỏi này.\n\nTôi có thể trả lời tốt các thông tin về:\n• **Giờ làm việc**\n• **Danh sách dịch vụ**\n• **Cách đặt lịch khám**\n• **Cấp cứu & Địa chỉ**\n\nHoặc bạn có thể gọi Hotline **0901 234 567** để gặp trực tiếp bác sĩ nhé!`;
  }

  // Giả lập độ trễ 800ms để giống người thật đang gõ phím
  setTimeout(() => {
    res.json({ answer });
  }, 800);
};
