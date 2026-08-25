import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Phone, Mail, Lock, Camera, Save, Eye, EyeOff,
  CheckCircle, LogOut, Calendar, PawPrint, FileText, Upload, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAlert } from '../contexts/AlertContext';

const getUser = () => {
  try { return JSON.parse(sessionStorage.getItem('user') || 'null'); }
  catch { return null; }
};

const TABS = [
  { key: 'info', label: 'Thông tin', icon: User },
  { key: 'password', label: 'Mật khẩu', icon: Lock },
];

export default function MyProfile() {
  const user = getUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null); // Base64 string
  const fileInputRef = useRef(null);
  const { showAlert, showConfirm } = useAlert();

  const [formData, setFormData] = useState({ fullName: '', phone: '' });
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  useEffect(() => {
    if (!user) { window.location.href = '/login'; return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/users/me', { headers: { Authorization: `Bearer ${user.token}` } });
      setProfile(res.data);
      setFormData({ fullName: res.data.fullName, phone: res.data.phone || '' });
      setAvatarPreview(res.data.avatar || '');
    } catch {}
    finally { setLoading(false); }
  };

  // Xử lý chọn ảnh từ thiết bị
  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showAlert('Lỗi', 'Vui lòng chọn file ảnh (jpg, png, gif...)', 'error');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showAlert('Lỗi', 'Ảnh quá lớn. Vui lòng chọn ảnh dưới 3MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setAvatarFile(reader.result); // Base64
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(''); setSuccess('');
    try {
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        avatar: avatarFile || avatarPreview, // Base64 hoặc URL gốc
      };
      const res = await axios.put('/api/users/me', payload, { headers: { Authorization: `Bearer ${user.token}` } });
      setProfile(res.data);
      const updatedUser = { ...user, fullName: res.data.fullName, avatar: res.data.avatar };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userChanged'));
      setAvatarFile(null); // Reset pending file
      setSuccess('Cập nhật thông tin thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi cập nhật');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirm) { setError('Mật khẩu mới không khớp'); return; }
    if (passData.newPassword.length < 6) { setError('Mật khẩu mới cần ít nhất 6 ký tự'); return; }
    setChangingPass(true); setError(''); setSuccess('');
    try {
      await axios.put('/api/users/me/password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setPassData({ currentPassword: '', newPassword: '', confirm: '' });
      setSuccess('Đổi mật khẩu thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi đổi mật khẩu');
    } finally { setChangingPass(false); }
  };

  const handleLogout = () => {
    showConfirm('Xác nhận đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?', () => {
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    });
  };

  const roleConfig = {
    admin: { label: '👑 Quản trị viên', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    veterinarian: { label: '🩺 Bác sĩ thú y', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
    customer: { label: '🐾 Khách hàng', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  };
  const roleInfo = roleConfig[profile?.role] || roleConfig.customer;

  if (loading) return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-warm py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-64" />
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-warm py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tài khoản của tôi</h1>
          <p className="text-slate-500 mt-1">Quản lý thông tin cá nhân và bảo mật</p>
        </div>

        {/* Alert messages */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-teal-50 border border-teal-200 text-teal-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" /> {success}
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile card */}
        <div className="card overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-24 bg-gradient-brand" />

          {/* Avatar section */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-12 mb-5">
              {/* Avatar with upload button */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={profile?.fullName}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full avatar-initials text-3xl font-black">
                      {profile?.fullName?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Upload overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                  title="Thay đổi ảnh đại diện"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
                <input
                  ref={fileInputRef} type="file" accept="image/*"
                  onChange={handleAvatarFileChange} className="hidden"
                />
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <h2 className="text-xl font-black text-slate-900 truncate">{profile?.fullName}</h2>
                <p className="text-slate-500 text-sm truncate">{profile?.email}</p>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border mt-1 inline-block ${roleInfo.cls}`}>
                  {roleInfo.label}
                </span>
              </div>

              {avatarFile && (
                <div className="flex gap-2 pb-1">
                  <span className="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-1 rounded-lg border border-teal-200">
                    <Upload className="w-3 h-3 inline mr-1" />Ảnh mới
                  </span>
                  <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(profile?.avatar || ''); }}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Tip upload */}
            <p className="text-xs text-slate-400 mb-5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              Hover vào ảnh đại diện để thay đổi. Hỗ trợ JPG, PNG, GIF (tối đa 3MB).
            </p>

            {/* Tabs */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6 gap-1">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => { setActiveTab(key); setError(''); setSuccess(''); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Tab: Thông tin */}
              {activeTab === 'info' && (
                <motion.form
                  key="info"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                  onSubmit={handleSaveProfile} className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      <User className="w-4 h-4 inline mr-1" /> Họ và tên
                    </label>
                    <input type="text" required value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      className="input-field" placeholder="Họ và tên" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      <Phone className="w-4 h-4 inline mr-1" /> Số điện thoại
                    </label>
                    <input type="tel" value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field" placeholder="Nhập số điện thoại..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      <Mail className="w-4 h-4 inline mr-1" /> Email
                    </label>
                    <input type="text" value={profile?.email || ''} readOnly
                      className="input-field bg-slate-100 text-slate-400 cursor-not-allowed" />
                    <p className="text-xs text-slate-400 mt-1">Email không thể thay đổi</p>
                  </div>
                  <button type="submit" disabled={saving} className="btn-primary w-full py-3 shine">
                    <Save className="w-4 h-4" />
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </motion.form>
              )}

              {/* Tab: Đổi mật khẩu */}
              {activeTab === 'password' && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                >
                  {profile?.googleId && !profile?.password ? (
                    <div className="text-center py-8 text-slate-400">
                      <Lock className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="font-medium text-slate-600">Tài khoản Google</p>
                      <p className="text-sm mt-1">Tài khoản đăng nhập bằng Google không sử dụng mật khẩu.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu hiện tại</label>
                        <div className="relative">
                          <input type={showOldPass ? 'text' : 'password'} required value={passData.currentPassword}
                            onChange={e => setPassData({ ...passData, currentPassword: e.target.value })}
                            className="input-field pr-12" placeholder="••••••••" />
                          <button type="button" onClick={() => setShowOldPass(!showOldPass)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu mới</label>
                        <div className="relative">
                          <input type={showNewPass ? 'text' : 'password'} required minLength={6} value={passData.newPassword}
                            onChange={e => setPassData({ ...passData, newPassword: e.target.value })}
                            className="input-field pr-12" placeholder="Ít nhất 6 ký tự" />
                          <button type="button" onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Xác nhận mật khẩu mới</label>
                        <input type="password" required value={passData.confirm}
                          onChange={e => setPassData({ ...passData, confirm: e.target.value })}
                          className={`input-field ${passData.confirm && passData.newPassword !== passData.confirm ? 'border-red-300' : ''}`}
                          placeholder="Nhập lại mật khẩu mới" />
                        {passData.confirm && passData.newPassword !== passData.confirm && (
                          <p className="text-xs text-red-500 mt-1">Mật khẩu không khớp</p>
                        )}
                      </div>
                      <button type="submit" disabled={changingPass} className="btn-secondary w-full py-3">
                        <Lock className="w-4 h-4" />
                        {changingPass ? 'Đang đổi...' : 'Đổi mật khẩu'}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Quick links */}
        <div className="card p-4 grid grid-cols-3 gap-3">
          {[
            { to: '/my-appointments', icon: '📅', label: 'Lịch hẹn', sub: 'Xem lịch khám' },
            { to: '/my-pets', icon: '🐾', label: 'Thú cưng', sub: 'Quản lý hồ sơ' },
            { to: '/blog?tab=my', icon: '📝', label: 'Bài viết', sub: 'Quản lý bài đăng' },
          ].map(({ to, icon, label, sub }) => (
            <Link key={to} to={to}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-teal-50 hover:border-teal-200 border border-slate-200 transition-all group">
              <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{label}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition font-semibold">
          <LogOut className="w-5 h-5" /> Đăng xuất khỏi tài khoản
        </button>
      </div>
    </div>
  );
}
