import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Plus, X, Search, Users, Phone, Camera, Upload, Shield, Star } from 'lucide-react';
import { useAlert } from '../../contexts/AlertContext';

export default function Staffs() {
  const [staffs, setStaffs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const { showAlert, showConfirm } = useAlert();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: 'Veterinarian', bio: '', phone: '', image: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const fetchStaffs = async () => {
    try {
      const res = await axios.get('/api/staffs');
      setStaffs(res.data);
      setFiltered(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStaffs(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(staffs.filter(s =>
      s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q)
    ));
  }, [search, staffs]);

  const ROLES = [
    { value: 'Veterinarian', label: 'Bác sĩ Thú y', color: 'bg-brand-50 text-brand-700 border-brand-200' },
    { value: 'Groomer', label: 'Chuyên viên Grooming', color: 'bg-violet-50 text-violet-700 border-violet-200' },
    { value: 'Nurse', label: 'Y tá', color: 'bg-brand-50 text-brand-700 border-brand-200' },
    { value: 'Admin', label: 'Quản trị viên', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ];

  const getRoleConfig = (roleVal) => ROLES.find(r => r.value === roleVal) || ROLES[0];

  const openModal = (staff = null) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({ name: staff.name, role: staff.role, bio: staff.bio || '', phone: staff.phone || '', image: staff.image || '' });
      setImagePreview(staff.image || '');
    } else {
      setEditingStaff(null);
      setFormData({ name: '', role: 'Veterinarian', bio: '', phone: '', image: '' });
      setImagePreview('');
    }
    setIsModalOpen(true);
  };

  // Xử lý upload ảnh từ thiết bị
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showAlert('Lỗi', 'Vui lòng chọn file ảnh', 'error');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showAlert('Lỗi', 'Ảnh quá lớn (tối đa 3MB)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = JSON.parse(sessionStorage.getItem('user'))?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (editingStaff) {
        await axios.put(`/api/staffs/${editingStaff._id}`, formData, config);
      } else {
        await axios.post('/api/staffs', formData, config);
      }
      setIsModalOpen(false);
      fetchStaffs();
      showAlert('Thành công', editingStaff ? 'Đã cập nhật nhân sự' : 'Đã thêm nhân sự', 'success');
    } catch {
      showAlert('Lỗi', 'Lỗi lưu nhân sự', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = (id) => {
    showConfirm('Xác nhận xóa', 'Xóa nhân sự này?', async () => {
      const token = JSON.parse(sessionStorage.getItem('user'))?.token;
      try {
        await axios.delete(`/api/staffs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchStaffs();
        showAlert('Thành công', 'Đã xóa nhân sự', 'success');
      } catch { showAlert('Lỗi', 'Lỗi xóa', 'error'); }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý Nhân sự</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Đội ngũ y tế và nhân viên phòng khám · {staffs.length} thành viên</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 py-2.5 ring-1 ring-slate-200 dark:ring-white/10 focus-within:ring-brand-500 transition-all w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc vai trò..."
              className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
            />
          </div>
          <button onClick={() => openModal()} className="btn-primary w-full sm:w-auto py-2.5 px-5 text-sm flex items-center justify-center gap-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/30 transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Thêm nhân sự
          </button>
        </div>
      </div>

      {/* Staff grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-44" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-slate-600">Chưa có nhân sự nào</p>
          <p className="text-sm mt-1">Nhấn "Thêm nhân sự" để bắt đầu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((staff, idx) => {
            const roleConfig = getRoleConfig(staff.role);
            return (
              <motion.div
                key={staff._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 ring-1 ring-slate-200 dark:ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-brand-500/50 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-3xl rounded-full pointer-events-none" />
                <div className="flex items-start gap-4 mb-4 relative z-10">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 ring-1 ring-slate-200 dark:ring-white/10 relative bg-slate-100 flex items-center justify-center">
                    {/* Fallback Initials */}
                    <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-black bg-gradient-to-br from-brand-500 to-brand-600">
                      {staff.name?.charAt(0)?.toUpperCase() || <Users className="w-6 h-6" />}
                    </div>
                    {/* Image */}
                    {staff.image && (
                      <img src={staff.image} alt={staff.name}
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        onError={e => { e.target.style.display = 'none'; }} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{staff.name}</h3>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${roleConfig.color}`}>
                      {roleConfig.label}
                    </span>
                    {staff.phone && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">
                        <Phone className="w-3.5 h-3.5" /> {staff.phone}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 h-10 mb-6 leading-relaxed relative z-10">
                  {staff.bio || 'Chưa có thông tin tiểu sử.'}
                </p>

                <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-white/5 relative z-10">
                  <button onClick={() => openModal(staff)}
                    className="flex-1 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95">
                    <Edit2 className="w-4 h-4" /> Chỉnh sửa
                  </button>
                  <button onClick={() => handleDelete(staff._id)}
                    className="flex-1 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95">
                    <Trash2 className="w-4 h-4" /> Gỡ bỏ
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-slate-200 dark:ring-white/10"
            >
              {/* Modal header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50">
                <h3 className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  {editingStaff ? 'Cập nhật nhân sự' : 'Thêm nhân sự mới'}
                </h3>
                <button onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {/* Avatar upload */}
                <div className="flex flex-col items-center gap-4 mb-2">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800 shadow-sm relative">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white bg-gradient-to-br from-brand-500 to-brand-600">
                          {formData.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" /> Tải ảnh lên
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*"
                    onChange={handleImageFileChange} className="hidden" />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Họ tên *</label>
                  <input type="text" required value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all" placeholder="VD: BS. Nguyễn Văn A" />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Vai trò *</label>
                  <select value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all">
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Số điện thoại</label>
                  <input type="text" value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all" placeholder="0901 234 567" />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tiểu sử</label>
                  <textarea rows="3" value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none" placeholder="Kinh nghiệm, chuyên môn..." />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95">
                    Hủy
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100">
                    {saving ? 'Đang lưu...' : (editingStaff ? 'Cập nhật' : 'Thêm mới')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
