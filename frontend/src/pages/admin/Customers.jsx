import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Trash2, X, Search, Users, Phone, Mail, PawPrint, CalendarCheck, Edit2, Shield, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlert } from '../../contexts/AlertContext';

const ROLE_LABELS = {
  customer: { label: 'Khách hàng', className: 'badge-confirmed' },
  admin: { label: 'Quản trị viên', className: 'badge-pending' },
  veterinarian: { label: 'Bác sĩ thú y', className: 'badge-completed' },
};

export default function Customers() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '', role: 'customer' });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showAlert, showConfirm } = useAlert();

  const token = JSON.parse(sessionStorage.getItem('user') || 'null')?.token;

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
      setFiltered(res.data);
    } catch (e) { console.error('Fetch users error', e); }
    finally { setLoading(false); }
  };

  const fetchUserDetail = async (userId) => {
    try {
      const [petsRes, appRes] = await Promise.all([
        axios.get(`/api/users/${userId}/pets`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/users/${userId}/appointments`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setPets(petsRes.data);
      setAppointments(appRes.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter(c => {
      const matchSearch = c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone || '').includes(q);
      const matchRole = roleFilter === 'all' || c.role === roleFilter;
      return matchSearch && matchRole;
    }));
  }, [search, roleFilter, users]);

  const openDetails = (user) => {
    setSelectedUser(user);
    setEditForm({ fullName: user.fullName, phone: user.phone || '', role: user.role });
    setIsEditMode(false);
    setIsModalOpen(true);
    fetchUserDetail(user._id);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`/api/users/${selectedUser._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => prev.map(u => u._id === selectedUser._id ? { ...u, ...res.data } : u));
      setSelectedUser({ ...selectedUser, ...res.data });
      setIsEditMode(false);
      showAlert('Thành công', 'Đã cập nhật thông tin người dùng', 'success');
    } catch (e) {
      showAlert('Lỗi', e.response?.data?.message || 'Lỗi cập nhật', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    showConfirm('Xác nhận xóa', 'Xóa người dùng này? Hành động không thể hoàn tác.', async () => {
      try {
        await axios.delete(`/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setUsers(prev => prev.filter(u => u._id !== id));
        setIsModalOpen(false);
        showAlert('Thành công', 'Đã xóa người dùng', 'success');
      } catch (e) {
        showAlert('Lỗi', e.response?.data?.message || 'Lỗi xóa người dùng', 'error');
      }
    });
  };

  const statusConfig = {
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
  };

  const statusLabels = { pending: 'Chờ duyệt', confirmed: 'Đã xác nhận', completed: 'Hoàn thành', cancelled: 'Đã hủy' };

  return (
    <div className="space-y-6">
      {/* Header & Stats Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Header (Span 2) */}
        <div className="lg:col-span-4 xl:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm flex flex-col justify-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý Người dùng</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">{users.length} tài khoản đã đăng ký hệ thống</p>
          
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 py-2.5 ring-1 ring-slate-200 dark:ring-white/10 focus-within:ring-brand-500 transition-all flex-1">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text" placeholder="Tìm theo tên, email, SĐT..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
              />
            </div>
            <select
              value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-brand-500 transition cursor-pointer"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="customer">Khách hàng</option>
              <option value="veterinarian">Bác sĩ</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
        </div>

        {/* Stats (Span 2 split) */}
        <div className="lg:col-span-4 xl:col-span-2 grid grid-cols-3 gap-4">
          {[
            { label: 'Khách hàng', count: users.filter(u => u.role === 'customer').length, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-500/10' },
            { label: 'Bác sĩ thú y', count: users.filter(u => u.role === 'veterinarian').length, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
            { label: 'Quản trị viên', count: users.filter(u => u.role === 'admin').length, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-3xl p-5 ring-1 ring-slate-200/50 dark:ring-white/5 shadow-sm flex flex-col justify-center`}>
              <p className={`text-3xl font-black ${s.color}`}>{s.count}</p>
              <p className={`text-xs font-bold uppercase tracking-wider mt-2 ${s.color} opacity-80`}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden ring-1 ring-slate-200 dark:ring-white/10 shadow-sm">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/50">
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Người dùng</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Liên hệ</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Vai trò</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Ngày đăng ký</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Loại TK</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map(c => (
                  <tr key={c._id} onClick={() => openDetails(c)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          {c.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{c.fullName}</p>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{c.phone || '—'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ROLE_LABELS[c.role]?.className || 'bg-slate-100 text-slate-600'}`}>
                        {ROLE_LABELS[c.role]?.label || c.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-400">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {c.googleId ? 'Google' : 'Email'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button onClick={e => { e.stopPropagation(); openDetails(c); }} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                      {c.role !== 'admin' && (
                        <button onClick={e => { e.stopPropagation(); handleDelete(c._id); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-16 text-slate-500 dark:text-slate-400 font-medium text-sm">Không tìm thấy người dùng nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedUser && (
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
              className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-slate-200 dark:ring-white/10"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-black text-2xl shadow-sm">
                    {selectedUser.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-xl tracking-tight text-slate-900 dark:text-white">{selectedUser.fullName}</h3>
                    <span className={`inline-block mt-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${ROLE_LABELS[selectedUser.role]?.className}`}>
                      {ROLE_LABELS[selectedUser.role]?.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditMode ? (
                    <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors active:scale-95">
                      <Edit2 className="w-4 h-4" /> Sửa
                    </button>
                  ) : (
                    <button onClick={handleUpdate} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100">
                      <Save className="w-4 h-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                  )}
                  {selectedUser.role !== 'admin' && (
                    <button onClick={() => handleDelete(selectedUser._id)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors active:scale-95">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setIsModalOpen(false)} className="p-2 ml-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                {/* Edit Form hoặc Info */}
                {isEditMode ? (
                  <div className="grid grid-cols-2 gap-5 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-3xl ring-1 ring-slate-200 dark:ring-white/5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Họ và tên</label>
                      <input value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Số điện thoại</label>
                      <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all" placeholder="Chưa có SĐT" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Vai trò</label>
                      <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all">
                        <option value="customer">Khách hàng</option>
                        <option value="veterinarian">Bác sĩ thú y</option>
                        <option value="admin">Quản trị viên</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { icon: Mail, label: 'Email', value: selectedUser.email },
                      { icon: Phone, label: 'SĐT', value: selectedUser.phone || 'Chưa cập nhật' },
                      { icon: Shield, label: 'Ngày đăng ký', value: new Date(selectedUser.createdAt).toLocaleDateString('vi-VN') },
                    ].map(item => (
                      <div key={item.label} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl ring-1 ring-slate-200 dark:ring-white/5 flex flex-col gap-2">
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center ring-1 ring-slate-200 dark:ring-white/10 shadow-sm">
                          <item.icon className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{item.label}</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white break-all mt-0.5">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Thú cưng */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-3xl ring-1 ring-slate-200 dark:ring-white/5">
                    <h4 className="font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center">
                        <PawPrint className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      </div>
                      Thú cưng ({pets.length})
                    </h4>
                    {pets.length === 0 ? (
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center py-6">Chưa có thú cưng nào</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {pets.map(p => (
                          <div key={p._id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-2xl shrink-0">
                              {p.species === 'Chó' ? '🐕' : p.species === 'Mèo' ? '🐈' : '🐾'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{p.species}{p.breed ? ` · ${p.breed}` : ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Lịch sử lịch hẹn */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-3xl ring-1 ring-slate-200 dark:ring-white/5">
                    <h4 className="font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center">
                        <CalendarCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      </div>
                      Lịch sử hẹn ({appointments.length})
                    </h4>
                    {appointments.length === 0 ? (
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center py-6">Chưa có lịch hẹn nào</p>
                    ) : (
                      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                        {appointments.map(a => (
                          <div key={a._id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                              <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{a.services?.map(s => s.name).join(', ') || a.service}</p>
                              <span className={`${statusConfig[a.status] || 'bg-slate-100 text-slate-600'} shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider`}>
                                {statusLabels[a.status] || a.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                              <span>{a.petId?.name || 'Thú cưng'}</span>
                              <span>•</span>
                              <span>{a.date} ({a.timeSlot})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const statusConfig = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
};

const statusLabels = { pending: 'Chờ duyệt', confirmed: 'Đã xác nhận', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
