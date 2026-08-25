import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_REPLIES = [
  '📅 Đặt lịch khám',
  '⏰ Giờ làm việc',
  '💉 Dịch vụ tiêm phòng',
  '🚑 Cấp cứu thú cưng',
];

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Xin chào! 🐾 Tôi là **Vet AI Assistant** của KT Pet Clinic.\n\nTôi có thể giúp bạn:\n• Tư vấn về sức khỏe thú cưng\n• Thông tin dịch vụ & lịch làm việc\n• Hỗ trợ đặt lịch khám\n\nBạn cần hỗ trợ gì?',
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  const formatMessage = (text) => {
    // Simple markdown-lite: bold
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question) return;

    const userMsg = { sender: 'user', text: question, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ sender: m.sender, text: m.text }));
      const res = await axios.post('/api/chatbot/ask', { question, history });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.answer, time: new Date() }]);
    } catch {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: '⚠️ Xin lỗi, trợ lý AI đang tạm thời không khả dụng. Vui lòng gọi hotline **0901 234 567** để được hỗ trợ!',
        time: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleReset = () => {
    setMessages([{
      sender: 'bot',
      text: 'Cuộc trò chuyện đã được làm mới! 🔄 Tôi có thể giúp gì cho bạn?',
      time: new Date()
    }]);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            key="toggle"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/40 flex items-center justify-center transition-colors group"
            title="Chat với AI Assistant"
          >
            <Bot className="w-7 h-7" />
            {/* Pulse ring */}
            <span className="absolute -top-1 -right-1 w-4 h-4">
              <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping-slow" />
              <span className="relative inline-flex w-4 h-4 rounded-full bg-blue-500 items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </span>
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="chatbox"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-[340px] sm:w-[380px] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col bg-white"
            style={{ height: '540px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Vet AI Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-blue-100 text-xs">Online • Phản hồi tức thì</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg text-blue-100 hover:bg-white/20 transition"
                  title="Làm mới chat"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-blue-100 hover:bg-white/20 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center mr-2 shrink-0 mt-auto">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="max-w-[78%]">
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm shadow-sm'
                      }`}
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                    />
                    <p className={`text-xs text-slate-400 mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.time)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center mr-2 shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5 items-center h-4">
                      <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full block" />
                      <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full block" />
                      <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full block" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            {messages.length <= 2 && !isLoading && (
              <div className="px-3 py-2 bg-white border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2 px-1">Câu hỏi nhanh:</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_REPLIES.map(qr => (
                    <button
                      key={qr}
                      onClick={() => sendMessage(qr)}
                      className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition font-medium border border-blue-100"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 text-sm px-4 py-2.5 bg-slate-100 rounded-xl outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 transition-all placeholder:text-slate-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
