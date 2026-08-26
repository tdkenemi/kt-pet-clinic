import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { io } from 'socket.io-client';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const u = JSON.parse(sessionStorage.getItem('user'));
    setUser(u);
    if (!u || u.role === 'admin') return;

    const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join_room', u._id);

    newSocket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      setIsOpen(prevIsOpen => {
        if (!prevIsOpen) {
          setUnreadCount(count => count + 1);
        }
        return prevIsOpen;
      });
    });

    axios.get('/api/messages', { headers: { Authorization: `Bearer ${u.token}` } })
      .then(res => {
        setMessages(res.data);
        const unread = res.data.filter(m => m.senderType === 'admin' && !m.isReadByUser).length;
        setUnreadCount(unread);
      })
      .catch(console.error);

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      setUnreadCount(0);
      axios.get('/api/messages', { headers: { Authorization: `Bearer ${user.token}` } }).catch(console.error);
    }
  }, [isOpen, unreadCount, user]);

  if (!user || user.role === 'admin') return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tmpMsg = { content: newMessage, senderType: 'user', createdAt: new Date() };
    setMessages(prev => [...prev, tmpMsg]);
    setNewMessage('');

    try {
      await axios.post('/api/messages', { content: tmpMsg.content }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
    } catch (error) {
      console.error('Lỗi gửi tin nhắn', error);
    }
  };

  return (
    <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[340px] h-[450px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-brand-500/20 ring-1 ring-slate-200 dark:ring-white/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-brand text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <StethoscopeIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Hỗ trợ trực tuyến</h3>
                  <p className="text-[10px] text-white/80">Chúng tôi luôn sẵn sàng hỗ trợ</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
              {messages.length === 0 ? (
                <div className="text-center text-sm text-slate-400 mt-10">
                  <p>Xin chào! Chúng tôi có thể giúp gì cho bạn?</p>
                </div>
              ) : (
                messages.map((m, i) => {
                  const isUser = m.senderType === 'user';
                  return (
                    <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-2.5 text-sm shadow-sm ${
                        isUser 
                          ? 'bg-brand-600 text-white rounded-2xl rounded-br-sm' 
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl rounded-bl-sm ring-1 ring-slate-200 dark:ring-white/5'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/10 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white rounded-xl transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30 relative"
      >
        {isOpen ? <ChevronDown className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>
    </div>
  );
}

const StethoscopeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
    <circle cx="20" cy="10" r="2" />
  </svg>
);
