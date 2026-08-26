import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, PawPrint, LogOut, Settings,
  FileText, Bell, ArrowLeft, Menu, X, Stethoscope, BookOpen, Activity, DollarSign,
  ChevronRight, Syringe, CreditCard, ClipboardList, Sun, Moon, MessageCircle
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import axios from 'axios';

const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.99 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: -10, scale: 0.99 }
};

const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export default function AdminLayout() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [adminNotifs, setAdminNotifs] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadChat, setUnreadChat] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const loadUser = () => {
    const storedUser = sessionStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'admin' && parsedUser.role !== 'veterinarian') {
        sessionStorage.removeItem('user');
        navigate('/login');
        return;
      }
      setUser(parsedUser);
    } catch {
      sessionStorage.removeItem('user');
      navigate('/login');
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('userChanged', loadUser);
    return () => window.removeEventListener('userChanged', loadUser);
  }, [navigate]);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'veterinarian')) {
      const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');
      socket.emit('join_admin');

      socket.on('receive_message', (msg) => {
        // If not on chat page, increment badge
        if (!location.pathname.startsWith('/admin/chat')) {
          setUnreadChat(prev => prev + 1);
        }
      });

      socket.on('new_appointment', (appt) => {
        setUnreadNotifs(prev => prev + 1);
        setAdminNotifs(prev => [appt, ...prev].slice(0, 10));
      });

      // Initial counts
      axios.get('/api/messages/conversations', { headers: { Authorization: `Bearer ${user.token}` } })
        .then(res => {
          const unread = res.data.reduce((acc, conv) => {
            if (conv.latestMessage?.senderType === 'user' && !conv.latestMessage?.isReadByAdmin) {
              return acc + 1;
            }
            return acc;
          }, 0);
          setUnreadChat(unread);
        })
        .catch(console.error);

      // Fetch recent appointments for notifications dropdown
      axios.get('/api/appointments', { headers: { Authorization: `Bearer ${user.token}` } })
        .then(res => {
          // just top 10 most recent
          setAdminNotifs(res.data.slice(0, 10));
        })
        .catch(console.error);

      return () => socket.disconnect();
    }
  }, [user, location.pathname]);

  if (!user) return null;

  const menuItems = [
    { path: '/admin', name: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/admin/appointments', name: 'Lịch hẹn', icon: Calendar },
    { path: '/admin/roster', name: 'Bảng phân công', icon: ClipboardList },
    { path: '/admin/staffs', name: 'Nhân sự', icon: Users },
    { path: '/admin/customers', name: 'Khách hàng', icon: Users },
    { path: '/admin/pets', name: 'Thú cưng', icon: PawPrint },
    { path: '/admin/services', name: 'Dịch vụ', icon: Activity },
    { path: '/admin/revenue', name: 'Tài chính', icon: DollarSign },
    { path: '/admin/chat', name: 'Tin nhắn', icon: MessageCircle, badge: unreadChat },
    { path: '/admin/blogs', name: 'Blog', icon: BookOpen },
    { path: '/admin/medical-records', name: 'Hồ sơ y tế', icon: FileText },
    { path: '/admin/settings', name: 'Cài đặt', icon: Settings },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  // Breadcrumb
  const currentMenu = menuItems.find(item => isActive(item));
  const breadcrumb = currentMenu?.name || 'Dashboard';

  const Sidebar = () => (
    <div className="w-[260px] flex flex-col h-full bg-slate-950 border-r border-white/5 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-64 bg-brand-500/10 blur-[80px] pointer-events-none" />
      
      {/* Logo */}
      <div className="px-6 py-6 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20 ring-1 ring-white/20">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base tracking-tight leading-tight">KT Clinic</h2>
            <p className="text-brand-400 text-[10px] font-semibold uppercase tracking-widest mt-0.5">
              {user.role === 'admin' ? 'Workspace' : 'Veterinarian'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar z-10 relative">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-4 mt-2">Core Menu</p>
        {menuItems.map(item => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                active
                  ? 'text-white bg-white/10 ring-1 ring-white/10 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute left-0 top-0 w-1 h-full bg-brand-400 rounded-r-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-4 h-4 shrink-0 transition-colors duration-300 ${active ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="flex-1 tracking-tight">{item.name}</span>
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="p-4 z-10 relative border-t border-white/5 bg-slate-950/50 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-white/10">
            {user.avatar ? (
              <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 text-white text-sm font-bold">
                {user.fullName?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate tracking-tight">{user.fullName}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/"
            className="flex-1 flex justify-center items-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 ring-1 ring-white/10 rounded-xl transition text-xs font-medium text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Client
          </Link>
          <button
            onClick={() => { sessionStorage.removeItem('user'); navigate('/login'); }}
            className="flex-1 flex justify-center items-center gap-2 p-2.5 bg-red-500/10 hover:bg-red-500/20 ring-1 ring-red-500/20 rounded-xl transition text-xs font-medium text-red-400 hover:text-red-300"
          >
            <LogOut className="w-3.5 h-3.5" /> Thoát
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900" style={{ fontFamily: '"Inter", sans-serif' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full z-50 flex lg:hidden"
            >
              <Sidebar />
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-0 translate-x-full ml-2 p-2 bg-white rounded-r-xl shadow-lg text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-slate-50 dark:bg-[#0a0a0a]">
        {/* Top header */}
        <header className="h-16 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400 hidden sm:block">Admin</span>
              <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />
              <span className="font-semibold text-slate-800">{breadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="hidden sm:flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              {lang === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN'}
            </button>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => { setUnreadNotifs(0); setShowNotifDropdown(!showNotifDropdown); }}
                className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotifDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowNotifDropdown(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-brand-500/10 ring-1 ring-slate-200 dark:ring-white/10 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="font-semibold text-slate-800 dark:text-white">Thông báo lịch hẹn</h3>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {adminNotifs.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 text-sm">Chưa có thông báo nào.</div>
                        ) : (
                          adminNotifs.map((notif, i) => (
                            <div 
                              key={i} 
                              onClick={() => { setShowNotifDropdown(false); navigate('/admin/appointments'); }}
                              className="p-4 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition flex items-start gap-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                                <Calendar className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                  Lịch hẹn mới
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                  Ngày: {new Date(notif.date).toLocaleDateString('vi-VN')} - Giờ: {notif.timeSlot}
                                </p>
                                {notif.status === 'pending' && (
                                  <span className="inline-block mt-1 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md font-semibold">Chờ duyệt</span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-slate-200 hidden sm:block" />

            {/* User */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm ring-2 ring-brand-100">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                    {user.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{user.fullName}</p>
                <p className="text-xs text-slate-500 truncate max-w-[120px]">{user.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content with Animation */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
