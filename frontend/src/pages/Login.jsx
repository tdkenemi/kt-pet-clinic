import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Stethoscope, ArrowRight, Mail, Lock, KeyRound, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';

// Helper: lưu user vào sessionStorage
export const saveUser = (data) => {
  sessionStorage.setItem('user', JSON.stringify(data));
};
export const getUser = () => {
  try { return JSON.parse(sessionStorage.getItem('user') || 'null'); }
  catch { return null; }
};
export const clearUser = () => { sessionStorage.removeItem('user'); };

// Tabs: 'login' | 'register' | 'forgot'
// Forgot steps: 1=nhập email, 2=nhập OTP, 3=nhập MK mới

const tabVariants = {
  initial: (dir) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
  animate: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
};

export default function Login() {
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'forgot'
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Forgot password state
  const [forgotStep, setForgotStep] = useState(1); // 1 | 2 | 3
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [devOtp, setDevOtp] = useState(''); // chỉ dùng khi chưa config Gmail

  const switchTab = (newTab) => {
    const tabs = ['login', 'register', 'forgot'];
    const oldIdx = tabs.indexOf(tab);
    const newIdx = tabs.indexOf(newTab);
    setDirection(newIdx >= oldIdx ? 1 : -1);
    setTab(newTab);
    setError('');
    setFormData({ fullName: '', email: '', password: '', phone: '' });
    setForgotStep(1);
    setDevOtp('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = tab === 'login'
        ? { email: formData.email, password: formData.password }
        : formData;
      const res = await axios.post(endpoint, payload);
      saveUser(res.data);
      window.dispatchEvent(new Event('userChanged'));
      window.location.href = res.data.role === 'admin' || res.data.role === 'veterinarian' ? '/admin' : '/';
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('/api/auth/google', { credential: credentialResponse.credential });
      saveUser(res.data);
      window.dispatchEvent(new Event('userChanged'));
      window.location.href = res.data.role === 'admin' || res.data.role === 'veterinarian' ? '/admin' : '/';
    } catch { setError('Đăng nhập Google thất bại, vui lòng thử lại.'); }
  };

  // Bước 1: Gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email: forgotEmail });
      if (res.data.devOtp) {
        setDevOtp(res.data.devOtp);
        setForgotOtp(res.data.devOtp); // Tự điền cho tiện (chế độ demo)
      }
      setForgotStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi OTP, kiểm tra lại email.');
    } finally { setLoading(false); }
  };

  // Bước 2: Xác thực OTP → sang bước 3
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!forgotOtp || forgotOtp.length !== 6) {
      setError('Vui lòng nhập mã OTP 6 số');
      return;
    }
    setError('');
    setForgotStep(3);
  };

  // Bước 3: Đặt mật khẩu mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (forgotNewPass !== forgotConfirmPass) { setError('Mật khẩu xác nhận không khớp'); return; }
    if (forgotNewPass.length < 6) { setError('Mật khẩu cần ít nhất 6 ký tự'); return; }
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', {
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: forgotNewPass,
      });
      setForgotStep(4); // Thành công
      setTimeout(() => switchTab('login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP không đúng hoặc đã hết hạn.');
    } finally { setLoading(false); }
  };

  const heroStats = [
    { v: '5K+', l: 'Khách hàng' },
    { v: '12K+', l: 'Ca khám' },
    { v: '8+', l: 'Năm KN' },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-slate-50">
      {/* Left panel — Hero */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="Happy pets"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/85 via-brand-800/75 to-slate-900/90" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">KT Pet Clinic</span>
          </div>
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="inline-block px-3 py-1 bg-brand-400/20 text-brand-200 text-xs font-semibold rounded-full border border-brand-400/30 mb-4">
                🐾 Phòng khám thú cưng hàng đầu
              </span>
              <h2 className="text-4xl font-black mb-4 leading-tight tracking-tight">
                Sức khỏe thú cưng<br />là ưu tiên của chúng tôi
              </h2>
              <p className="text-brand-100/80 leading-relaxed text-base">
                Đặt lịch khám, theo dõi hồ sơ và nhận thông báo từ bác sĩ — tất cả trong một ứng dụng.
              </p>
            </motion.div>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {heroStats.map(({ v, l }) => (
                <motion.div
                  key={l}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/10"
                >
                  <div className="text-2xl font-black text-white">{v}</div>
                  <div className="text-xs text-brand-200 mt-1">{l}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Tab switcher */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-8 gap-1">
            {[
              { key: 'login', label: 'Đăng nhập' },
              { key: 'register', label: 'Đăng ký' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => switchTab(key)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 relative ${
                  tab === key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === key && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm"
                    style={{ zIndex: -1 }}
                  />
                )}
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            {/* ===== LOGIN / REGISTER ===== */}
            {(tab === 'login' || tab === 'register') && (
              <motion.div
                key={tab}
                custom={direction}
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="mb-7">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    {tab === 'login' ? 'Chào mừng trở lại 👋' : 'Tạo tài khoản mới'}
                  </h1>
                  <p className="text-slate-500 mt-1.5 text-sm">
                    {tab === 'login'
                      ? 'Đăng nhập để quản lý lịch khám của thú cưng.'
                      : 'Đăng ký để bắt đầu sử dụng dịch vụ của chúng tôi.'}
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2 mb-5"
                  >
                    <span className="text-base mt-0.5">⚠️</span> {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {tab === 'register' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Họ và tên</label>
                        <input
                          type="text" required value={formData.fullName}
                          onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                          className="input-field" placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại</label>
                        <input
                          type="tel" required value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="input-field" placeholder="0909 000 000"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      {tab === 'login' ? 'Email / Tên đăng nhập' : 'Email'}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text" required value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="input-field pl-10"
                        placeholder={tab === 'login' ? "email@example.com hoặc 'admin'" : "email@example.com"}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-semibold text-slate-700">Mật khẩu</label>
                      {tab === 'login' && (
                        <button
                          type="button"
                          onClick={() => switchTab('forgot')}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium hover:underline transition"
                        >
                          Quên mật khẩu?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPass ? 'text' : 'password'} required value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="input-field pl-10 pr-12" placeholder="••••••••"
                      />
                      <button
                        type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="btn-primary w-full py-3.5 text-base mt-1 shine"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Đang xử lý...
                      </span>
                    ) : (
                      <>{tab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'} <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

                <div className="divider my-6"><span>Hoặc tiếp tục với</span></div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Đăng nhập Google thất bại')}
                    useOneTap shape="pill" theme="outline" size="large"
                  />
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">
                  Bằng cách đăng nhập, bạn đồng ý với{' '}
                  <span className="text-brand-600 hover:underline cursor-pointer">Điều khoản sử dụng</span>
                </p>
              </motion.div>
            )}

            {/* ===== FORGOT PASSWORD ===== */}
            {tab === 'forgot' && (
              <motion.div
                key="forgot"
                custom={direction}
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.22 }}
              >
                <button
                  onClick={() => switchTab('login')}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6 transition group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Quay lại đăng nhập
                </button>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-8">
                  {[1, 2, 3].map((s) => (
                    <React.Fragment key={s}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                        forgotStep > s
                          ? 'bg-brand-600 text-white'
                          : forgotStep === s
                          ? 'bg-brand-600 text-white shadow-teal ring-4 ring-brand-100'
                          : 'bg-slate-200 text-slate-400'
                      }`}>
                        {forgotStep > s ? <CheckCircle className="w-4 h-4" /> : s}
                      </div>
                      {s < 3 && <div className={`flex-1 h-0.5 transition-all ${forgotStep > s ? 'bg-brand-500' : 'bg-slate-200'}`} />}
                    </React.Fragment>
                  ))}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2 mb-5"
                  >
                    <span className="mt-0.5">⚠️</span> {error}
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  {/* STEP 1 — Nhập email */}
                  {forgotStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                      <div className="mb-6">
                        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 border border-brand-100">
                          <Mail className="w-7 h-7 text-brand-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quên mật khẩu</h2>
                        <p className="text-slate-500 mt-1.5 text-sm">Nhập email tài khoản để nhận mã xác nhận OTP.</p>
                      </div>
                      <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email tài khoản</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="email" required value={forgotEmail}
                              onChange={e => setForgotEmail(e.target.value)}
                              className="input-field pl-10" placeholder="email@example.com"
                            />
                          </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                          {loading ? 'Đang gửi...' : <><span>Gửi mã OTP</span> <ArrowRight className="w-4 h-4" /></>}
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* STEP 2 — Nhập OTP */}
                  {forgotStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                      <div className="mb-6">
                        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 border border-brand-100">
                          <KeyRound className="w-7 h-7 text-brand-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nhập mã OTP</h2>
                        <p className="text-slate-500 mt-1.5 text-sm">
                          Mã OTP đã gửi về <span className="font-semibold text-slate-700">{forgotEmail}</span>
                        </p>
                      </div>
                      {devOtp && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
                          <span>🔑</span>
                          <span>Chế độ demo — OTP: <strong className="tracking-widest text-base">{devOtp}</strong></span>
                        </div>
                      )}
                      <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mã OTP (6 số)</label>
                          <input
                            type="text" required maxLength={6} value={forgotOtp}
                            onChange={e => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                            className="input-field text-center text-2xl tracking-[0.5em] font-bold"
                            placeholder="000000"
                          />
                        </div>
                        <button type="submit" className="btn-primary w-full py-3.5">
                          Xác nhận mã OTP <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setForgotStep(1); setDevOtp(''); setForgotOtp(''); }}
                          className="w-full text-center text-sm text-slate-500 hover:text-brand-600 transition flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Gửi lại mã
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* STEP 3 — Nhập mật khẩu mới */}
                  {forgotStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                      <div className="mb-6">
                        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 border border-brand-100">
                          <Lock className="w-7 h-7 text-brand-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mật khẩu mới</h2>
                        <p className="text-slate-500 mt-1.5 text-sm">Đặt mật khẩu mới cho tài khoản của bạn.</p>
                      </div>
                      <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu mới</label>
                          <div className="relative">
                            <input
                              type={showNewPass ? 'text' : 'password'} required minLength={6}
                              value={forgotNewPass} onChange={e => setForgotNewPass(e.target.value)}
                              className="input-field pr-12" placeholder="Ít nhất 6 ký tự"
                            />
                            <button type="button" onClick={() => setShowNewPass(!showNewPass)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                              {showNewPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Xác nhận mật khẩu</label>
                          <input
                            type="password" required value={forgotConfirmPass}
                            onChange={e => setForgotConfirmPass(e.target.value)}
                            className={`input-field ${forgotConfirmPass && forgotNewPass !== forgotConfirmPass ? 'border-red-300 focus:border-red-400' : ''}`}
                            placeholder="Nhập lại mật khẩu mới"
                          />
                          {forgotConfirmPass && forgotNewPass !== forgotConfirmPass && (
                            <p className="text-xs text-red-500 mt-1">Mật khẩu không khớp</p>
                          )}
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                          {loading ? 'Đang đặt lại...' : <><CheckCircle className="w-4 h-4" /> Đặt lại mật khẩu</>}
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* STEP 4 — Thành công */}
                  {forgotStep === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                      <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-brand-100">
                        <CheckCircle className="w-10 h-10 text-brand-600" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 mb-2">Thành công!</h2>
                      <p className="text-slate-500 text-sm">Mật khẩu đã được đặt lại. Đang chuyển về trang đăng nhập...</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
