import React, { useState, useEffect, useRef } from 'react';
import { Send, User, CheckCircle2, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

export function AdminChat() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const admin = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    if (!admin || admin.role !== 'admin') return;

    const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join_admin');

    newSocket.on('receive_message', (msg) => {
      // If message belongs to currently open chat
      setMessages(prev => {
        if (selectedUser && msg.userId === selectedUser._id) {
          return [...prev, msg];
        }
        return prev;
      });

      // Update conversation list
      fetchConversations();
    });

    fetchConversations();

    return () => newSocket.disconnect();
  }, [selectedUser]); // Added selectedUser to dependency array to have latest selectedUser in listener

  const fetchConversations = async () => {
    try {
      const res = await axios.get('/api/messages/conversations', {
        headers: { Authorization: `Bearer ${admin.token}` }
      });
      setConversations(res.data);
    } catch (error) {
      console.error('Lỗi tải danh sách chat', error);
    }
  };

  const selectConversation = async (user) => {
    setSelectedUser(user);
    try {
      const res = await axios.get(`/api/messages/${user._id}`, {
        headers: { Authorization: `Bearer ${admin.token}` }
      });
      setMessages(res.data);
    } catch (error) {
      console.error('Lỗi tải tin nhắn', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const tmpMsg = { content: newMessage, senderType: 'admin', createdAt: new Date() };
    setMessages(prev => [...prev, tmpMsg]);
    setNewMessage('');

    try {
      await axios.post('/api/messages', { content: tmpMsg.content, targetUserId: selectedUser._id }, {
        headers: { Authorization: `Bearer ${admin.token}` }
      });
      fetchConversations();
    } catch (error) {
      console.error('Lỗi gửi tin nhắn', error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Sidebar - Conversations */}
      <div className="w-1/3 border-r border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-brand-600" />
            Hội thoại
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">Không có cuộc hội thoại nào</div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.user._id}
                onClick={() => selectConversation(conv.user)}
                className={`w-full text-left p-4 flex gap-3 hover:bg-slate-50 transition border-b border-slate-50 ${selectedUser?._id === conv.user._id ? 'bg-brand-50/50' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0 relative">
                  {conv.user.avatar ? (
                    <img src={conv.user.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 bg-slate-100">
                      {conv.user.fullName.charAt(0)}
                    </div>
                  )}
                  {conv.unreadCount > 0 && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-slate-900 truncate text-sm">{conv.user.fullName}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(conv.latestMessage?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${conv.latestMessage?.senderType === 'user' && !conv.latestMessage?.isReadByAdmin ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                    {conv.latestMessage?.senderType === 'admin' ? 'Bạn: ' : ''}{conv.latestMessage?.content}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-2/3 flex flex-col bg-slate-50/30">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3 shadow-sm z-10">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 bg-slate-100">
                    {selectedUser.fullName.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{selectedUser.fullName}</h3>
                <p className="text-xs text-slate-500">{selectedUser.email}</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, i) => {
                const isAdmin = m.senderType === 'admin';
                return (
                  <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 text-sm shadow-sm ${
                      isAdmin 
                        ? 'bg-brand-600 text-white rounded-2xl rounded-br-sm' 
                        : 'bg-white text-slate-900 rounded-2xl rounded-bl-sm ring-1 ring-slate-200'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white rounded-xl transition flex items-center gap-2 font-semibold"
              >
                Gửi <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
            <p>Chọn một cuộc hội thoại để bắt đầu nhắn tin</p>
          </div>
        )}
      </div>
    </div>
  );
}
