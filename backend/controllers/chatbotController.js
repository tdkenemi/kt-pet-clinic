const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// gemini-flash-latest là alias được hỗ trợ (đã test thành công)
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-flash-latest';

const SYSTEM_PROMPT = `Bạn là "Vet AI Assistant" - trợ lý ảo thân thiện của phòng khám thú y KT Pet Clinic.

📋 Nhiệm vụ của bạn:
- Tư vấn thân thiện, chuyên nghiệp về các dịch vụ: Khám Tổng Quát, Cấp Cứu 24/7, Phẫu Thuật Y Khoa, Chăm Sóc Thẩm Mỹ, Tư Vấn Hành Vi.
- Cung cấp thông tin về lịch làm việc: Thứ 2-6: 08:00-20:00, Thứ 7-CN: 08:00-18:00, Cấp cứu 24/7.
- Trả lời ngắn gọn, dễ hiểu, đúng trọng tâm bằng tiếng Việt.
- Sử dụng emoji phù hợp để tạo cảm giác thân thiện.

⚠️ Quy tắc quan trọng:
- KHÔNG đưa ra chẩn đoán y khoa phức tạp hoặc kê đơn thuốc.
- Nếu triệu chứng nghiêm trọng, khuyên mang thú cưng đến phòng khám ngay.
- Nếu câu hỏi không liên quan đến thú y, nhẹ nhàng hướng về chăm sóc thú cưng.
- Luôn kết thúc bằng lời mời đặt lịch nếu phù hợp.`;

exports.askChatbot = async (req, res) => {
  const { question, history } = req.body;

  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ message: 'Vui lòng nhập câu hỏi.' });
  }

  const trimmed = question.trim().slice(0, 1000);

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Xây dựng prompt có context history nếu có
    let fullPrompt = SYSTEM_PROMPT + '\n\n';
    
    if (history && Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-6); // Giữ 6 tin nhắn gần nhất
      fullPrompt += 'Lịch sử cuộc trò chuyện:\n';
      recentHistory.forEach(msg => {
        if (msg.sender === 'user') fullPrompt += `Khách: ${msg.text}\n`;
        else fullPrompt += `Assistant: ${msg.text}\n`;
      });
      fullPrompt += '\n';
    }

    fullPrompt += `Câu hỏi hiện tại của khách hàng: "${trimmed}"`;

    const result = await model.generateContent(fullPrompt);
    const text = (result?.response?.text?.() || '').trim();

    if (!text) {
      return res.status(502).json({ message: 'AI không trả về nội dung, vui lòng thử lại.' });
    }

    res.json({ answer: text });
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    res.status(500).json({ message: 'Xin lỗi, trợ lý AI đang bận. Vui lòng thử lại sau.' });
  }
};
