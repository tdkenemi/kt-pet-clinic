import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Stethoscope, CalendarCheck, BookOpen, PawPrint, User, LogOut, ChevronDown, LayoutDashboard, Sun, Moon, Bell, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useBooking } from '../contexts/BookingContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { io } from 'socket.io-client';

const readUserFromStorage = () => {
  try { return JSON.parse(sessionStorage.getItem('user') || 'null'); }
  catch { return null; }
};

export function Topbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { cart } = useBooking();
  const [servicesList, setServicesList] = useState([]);
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    axios.get('/api/services')
      .then(res => setServicesList(res.data))
      .catch(err => console.error("Lỗi tải danh sách dịch vụ", err));
  }, []);

  useEffect(() => {
    const readUser = () => setUser(readUserFromStorage());
    readUser();
    window.addEventListener('userChanged', readUser);
    window.addEventListener('storage', readUser);
    return () => {
      window.removeEventListener('userChanged', readUser);
      window.removeEventListener('storage', readUser);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); setAvatarMenuOpen(false); setNotifMenuOpen(false); }, [location.pathname, location.search]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get('/api/notifications', { headers: { Authorization: `Bearer ${user.token}` } });
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Lỗi tải thông báo', error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    if (user) {
      const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');
      socket.emit('join_room', user._id);
      
      socket.on('new_notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      return () => socket.disconnect();
    }
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/read-all', {}, { headers: { Authorization: `Bearer ${user.token}` } });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('user');
    setUser(null);
    setAvatarMenuOpen(false);
    window.dispatchEvent(new Event('userChanged'));
    navigate('/');
  }, [navigate]);

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Về chúng tôi', path: '/about' },
    { 
      name: 'Các Dịch Vụ', 
      path: '#',
      children: servicesList.length > 0 
        ? servicesList.map(s => ({ name: s.name, path: '/booking' }))
        : [{ name: 'Đang tải...', path: '#' }]
    },
    { name: 'Blog & Cộng đồng', path: '/blog' },
    { name: 'Đặt lịch', path: '/booking', badge: cart.length > 0 ? cart.length : 0 },
    { name: 'Đánh giá', path: '/reviews' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const avatarMenuItems = [
    { icon: User, label: 'Thông tin tài khoản', path: '/profile' },
    { icon: CalendarCheck, label: 'Lịch hẹn của tôi', path: '/my-appointments' },
    { icon: PawPrint, label: 'Thú cưng của tôi', path: '/my-pets' },
    { icon: Activity, label: 'Hồ sơ y tế', path: '/my-medical-records' },
    { icon: BookOpen, label: 'Bài viết của tôi', path: '/blog?tab=my' },
  ];

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <header
      className={`fixed w-full top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/96 dark:bg-[#15171c]/96 backdrop-blur-md shadow-sm border-b border-slate-200/60 dark:border-white/5'
          : 'bg-white/80 dark:bg-[#15171c]/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-glow-brand bg-gradient-brand"
          >
            <Stethoscope className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none transition-colors">
              KT <span className="text-gradient-teal">Clinic</span>
            </span>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none font-medium tracking-wider">PET CARE</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            link.children ? (
              <div key={link.name} className="relative group px-1">
                <button className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5`}>
                  {link.name}
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#1e2028] border border-slate-100 dark:border-white/5 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                  <div className="py-2">
                    {link.children.map(child => (
                      <Link key={child.name} to={child.path} className="block px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-500/10 hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {link.name}
                {link.badge > 0 && (
                  <motion.span
                    key={link.badge}
                    initial={{ scale: 0 }}
                    animate={{ scale: [1.5, 1] }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="ml-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold inline-block"
                  >
                    {link.badge}
                  </motion.span>
                )}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-teal-50 dark:bg-teal-500/10 rounded-lg -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            )
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-2.5">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition"
          >
            {lang === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN'}
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              {/* Admin portal link */}
              {(user.role === 'admin' || user.role === 'veterinarian') && !isAdminPage && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Quản trị
                </Link>
              )}

              {/* Notifications */}
              <div className="relative pl-1 pr-3" ref={notifRef}>
                <button
                  onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                  className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#15171c]" />
                  )}
                </button>
                
                <AnimatePresence>
                  {notifMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#1e2028] rounded-2xl shadow-xl border border-slate-100 dark:border-white/5 overflow-hidden z-50 flex flex-col max-h-[80vh]"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 dark:text-white">Thông báo</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>
                      <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-1">
                        {notifications.length > 0 ? (
                          notifications.map(n => (
                            <div key={n._id} onClick={() => !n.isRead && markAsRead(n._id)} className={`p-3 rounded-xl flex items-start gap-3 cursor-pointer transition-colors ${n.isRead ? 'opacity-70 hover:bg-slate-50 dark:hover:bg-white/5' : 'bg-brand-50 dark:bg-brand-500/10'}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                n.type === 'success' ? 'bg-green-100 text-green-600' :
                                n.type === 'error' ? 'bg-red-100 text-red-600' :
                                n.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                <Bell className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{n.title}</p>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">{n.message}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                              </div>
                              {!n.isRead && <div className="w-2 h-2 bg-brand-500 rounded-full shrink-0 mt-3" />}
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-sm text-slate-400 py-6">Chưa có thông báo nào</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Avatar dropdown */}
              <div className="relative border-l border-slate-200 dark:border-white/10 pl-2" ref={avatarRef}>
                <button
                  onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition group"
                >
                  <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm ring-2 ring-teal-100 group-hover:ring-teal-300 transition">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold bg-gradient-brand">
                        {user.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[90px] truncate">
                    {user.fullName?.split(' ').slice(-1)[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${avatarMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {avatarMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-[#1e2028] rounded-2xl shadow-xl border border-slate-100 dark:border-white/5 overflow-hidden z-50"
                    >
                      {/* User info header */}
                      <div className="px-4 py-4 border-b border-slate-100 dark:border-white/5 bg-gradient-to-br from-teal-50 to-slate-50 dark:from-white/5 dark:to-transparent">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-teal-200 shrink-0">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm bg-gradient-brand">
                                {user.fullName?.charAt(0)?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{user.fullName}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1.5">
                        {avatarMenuItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setAvatarMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                          >
                            <item.icon className="w-4 h-4 shrink-0 text-slate-400" />
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-slate-100 py-1.5">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          Đăng xuất
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn-primary py-2 px-5 text-sm shine">
              Đăng nhập
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="lg:hidden overflow-hidden border-t border-slate-100 bg-white/98 backdrop-blur-md"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <div key={link.name}>
                  {link.children ? (
                    <div className="py-2 border-b border-slate-100/50">
                      <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">{link.name}</div>
                      {link.children.map(child => (
                        <Link key={child.name} to={child.path} onClick={() => setMobileMenuOpen(false)} className="block px-6 py-2.5 text-sm font-medium text-slate-600 hover:text-teal-600 hover:bg-slate-50 rounded-xl transition">
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition ${
                        isActive(link.path)
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {link.name}
                      {link.badge > 0 && (
                        <motion.span
                          key={link.badge}
                          initial={{ scale: 0 }}
                          animate={{ scale: [1.5, 1] }}
                          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                          className="ml-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold inline-block"
                        >
                          {link.badge}
                        </motion.span>
                      )}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-3 border-t border-slate-100 mt-3 space-y-2">
                <button
                  onClick={toggleLanguage}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  {lang === 'vi' ? '🇻🇳 Tiếng Việt' : '🇺🇸 English'}
                </button>

                {user ? (
                  <>
                    <div className="px-4 py-3 bg-teal-50 rounded-xl border border-teal-100 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold bg-gradient-brand">
                            {user.fullName?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
                        <p className="text-xs text-teal-600 truncate">{user.email}</p>
                      </div>
                    </div>
                    {(user.role === 'admin' || user.role === 'veterinarian') && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200">
                        <LayoutDashboard className="w-4 h-4" /> Trang quản trị
                      </Link>
                    )}
                    {avatarMenuItems.map(item => (
                      <Link key={item.path} to={item.path}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                        <item.icon className="w-4 h-4 text-slate-400" /> {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link to="/login"
                    className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-brand">
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
