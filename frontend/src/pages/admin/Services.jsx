import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Search, Activity, HeartPulse, CheckCircle, Banknote, QrCode } from 'lucide-react';
import { useAlert } from '../../contexts/AlertContext';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', emoji: '🩺', description: '', category: 'Medical', 
    basePrice: 0, estimatedDuration: 60, requiresOnsite: false, 
    homeServiceAvailable: true, isActive: true, allowedPaymentMethods: ['Cash', 'QR'] 
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showAlert, showConfirm } = useAlert();

  const token = JSON.parse(sessionStorage.getItem('user') || 'null')?.token;

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get('/api/services/admin', { headers: { Authorization: `Bearer ${token}` } });
      setServices(res.data);
      setFiltered(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(services.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q)
    ));
  }, [search, services]);

  const openModal = (svc = null) => {
    if (svc) {
      setEditingService(svc);
      setFormData({ 
        name: svc.name, emoji: svc.emoji, description: svc.description, 
        category: svc.category || 'Medical', basePrice: svc.basePrice || 0, 
        estimatedDuration: svc.estimatedDuration || 60, 
        clinicServiceAvailable: svc.clinicServiceAvailable !== undefined ? svc.clinicServiceAvailable : true, 
        homeServiceAvailable: svc.homeServiceAvailable || false, 
        isActive: svc.isActive,
        allowedPaymentMethods: svc.allowedPaymentMethods || ['Cash', 'QR']
      });
    } else {
      setEditingService(null);
      setFormData({ 
        name: '', emoji: '🩺', description: '', category: 'Medical', 
        basePrice: 0, estimatedDuration: 60, clinicServiceAvailable: true, 
        homeServiceAvailable: false, isActive: true, allowedPaymentMethods: ['Cash', 'QR']
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingService) {
        await axios.put(`/api/services/${editingService._id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('/api/services', formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      setIsModalOpen(false);
      fetchServices();
      showAlert('Thành công', editingService ? 'Đã cập nhật dịch vụ' : 'Đã thêm dịch vụ', 'success');
    } catch (err) {
      showAlert('Lỗi', err.response?.data?.message || 'Lỗi lưu dịch vụ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    showConfirm('Xác nhận xóa', 'Xóa dịch vụ này? Hành động này không thể hoàn tác.', async () => {
      try {
        await axios.delete(`/api/services/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchServices();
        showAlert('Thành công', 'Đã xóa dịch vụ', 'success');
      } catch { 
        showAlert('Lỗi', 'Lỗi xóa dịch vụ', 'error'); 
      }
    });
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý Dịch vụ</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Cấu hình các dịch vụ hiển thị cho khách hàng</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 py-2.5 ring-1 ring-slate-200 dark:ring-white/10 focus-within:ring-teal-500 transition-all w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm dịch vụ..."
              className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
            />
          </div>
          <button onClick={() => openModal()} className="btn-primary w-full sm:w-auto py-2.5 px-5 text-sm flex items-center justify-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/30 transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Thêm mới
          </button>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((svc, idx) => (
          <motion.div
            key={svc._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-white dark:bg-slate-900 rounded-3xl p-6 ring-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden ${svc.isActive ? 'ring-slate-200 dark:ring-white/10 hover:ring-teal-500/50' : 'ring-slate-200 dark:ring-white/10 opacity-70'}`}
          >
            {svc.isActive && <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 blur-3xl rounded-full pointer-events-none" />}
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm ${svc.isActive ? 'bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-500/10 dark:to-emerald-500/10 ring-1 ring-teal-500/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {svc.emoji}
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">{svc.name}</h3>
                  <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${svc.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-500'}`}>
                    {svc.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-5 h-10 line-clamp-2 leading-relaxed relative z-10">{svc.description || 'Chưa có mô tả chi tiết'}</p>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-6 text-xs text-slate-500 dark:text-slate-400 relative z-10">
              <div className="flex flex-col gap-1">
                <span className="uppercase tracking-wider text-[10px] font-bold text-slate-400">Phân loại</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{svc.category}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="uppercase tracking-wider text-[10px] font-bold text-slate-400">Giá cơ bản</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">{svc.basePrice?.toLocaleString()} ₫</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="uppercase tracking-wider text-[10px] font-bold text-slate-400">Thời lượng</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{svc.estimatedDuration} phút</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="uppercase tracking-wider text-[10px] font-bold text-slate-400">Làm tại nhà</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{svc.homeServiceAvailable ? 'Có hỗ trợ' : 'Không'}</span>
              </div>
            </div>
            
            <div className="flex gap-2 mb-6">
              {svc.allowedPaymentMethods?.includes('Cash') && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"><Banknote className="w-3 h-3" /> Tiền mặt</span>
              )}
              {svc.allowedPaymentMethods?.includes('QR') && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"><QrCode className="w-3 h-3" /> VietQR</span>
              )}
            </div>
            
            <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-white/5 relative z-10">
              <button onClick={() => openModal(svc)} className="flex-1 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95">
                <Edit2 className="w-4 h-4" /> Chỉnh sửa
              </button>
              <button onClick={() => handleDelete(svc._id)} className="flex-1 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95">
                <Trash2 className="w-4 h-4" /> Gỡ bỏ
              </button>
            </div>
          </motion.div>
        ))}
      </div>

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
              className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden ring-1 ring-slate-200 dark:ring-white/10"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50">
                <h3 className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  {editingService ? 'Cập nhật Dịch vụ' : 'Thêm Dịch vụ mới'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tên dịch vụ *</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" placeholder="VD: Khám bệnh tại nhà" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Emoji</label>
                    <input type="text" value={formData.emoji} onChange={e => setFormData({ ...formData, emoji: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" placeholder="VD: 🏠" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Phân loại *</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all">
                      <option value="Medical">Y tế (Medical)</option>
                      <option value="Grooming">Làm đẹp (Grooming)</option>
                      <option value="Hotel">Khách sạn (Hotel)</option>
                      <option value="HomeService">Dịch vụ tại nhà</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Giá (VNĐ)</label>
                    <input type="number" min="0" required value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Mô tả ngắn</label>
                    <textarea rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none" placeholder="VD: Bác sĩ đến tận nhà..." />
                  </div>
                  
                  <div className="col-span-2 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl ring-1 ring-slate-200 dark:ring-white/5 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" checked={formData.clinicServiceAvailable} onChange={e => setFormData({ ...formData, clinicServiceAvailable: e.target.checked })} className="peer sr-only" />
                        <div className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-teal-500 peer-checked:border-teal-500 transition-all" />
                        <CheckCircle className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Hỗ trợ làm tại phòng khám</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" checked={formData.homeServiceAvailable} onChange={e => setFormData({ ...formData, homeServiceAvailable: e.target.checked })} className="peer sr-only" />
                        <div className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-teal-500 peer-checked:border-teal-500 transition-all" />
                        <CheckCircle className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Hỗ trợ làm tại nhà</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group pt-2 border-t border-slate-200 dark:border-white/10">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="peer sr-only" />
                        <div className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-teal-500 peer-checked:border-teal-500 transition-all" />
                        <CheckCircle className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Hiển thị (Active)</span>
                    </label>
                  </div>
                  
                  <div className="col-span-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl ring-1 ring-blue-200 dark:ring-blue-800/30 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400 mb-2">Phương thức thanh toán hỗ trợ</p>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" checked={formData.allowedPaymentMethods?.includes('Cash')} onChange={e => {
                            const newMethods = e.target.checked 
                              ? [...(formData.allowedPaymentMethods || []), 'Cash'] 
                              : (formData.allowedPaymentMethods || []).filter(m => m !== 'Cash');
                            setFormData({ ...formData, allowedPaymentMethods: newMethods });
                          }} className="peer sr-only" />
                          <div className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all" />
                          <CheckCircle className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1"><Banknote className="w-4 h-4" /> Tiền mặt</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" checked={formData.allowedPaymentMethods?.includes('QR')} onChange={e => {
                            const newMethods = e.target.checked 
                              ? [...(formData.allowedPaymentMethods || []), 'QR'] 
                              : (formData.allowedPaymentMethods || []).filter(m => m !== 'QR');
                            setFormData({ ...formData, allowedPaymentMethods: newMethods });
                          }} className="peer sr-only" />
                          <div className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all" />
                          <CheckCircle className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1"><QrCode className="w-4 h-4" /> VietQR</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" checked={formData.allowedPaymentMethods?.includes('VNPay')} onChange={e => {
                            const newMethods = e.target.checked 
                              ? [...(formData.allowedPaymentMethods || []), 'VNPay'] 
                              : (formData.allowedPaymentMethods || []).filter(m => m !== 'VNPay');
                            setFormData({ ...formData, allowedPaymentMethods: newMethods });
                          }} className="peer sr-only" />
                          <div className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-rose-600 peer-checked:border-rose-600 transition-all" />
                          <CheckCircle className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors flex items-center gap-1">💳 VNPay</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-6 mt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95">
                    Đóng
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100">
                    {saving ? 'Đang lưu...' : 'Lưu dịch vụ'}
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
