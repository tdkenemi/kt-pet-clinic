import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Trash2, X, Plus, Search, PawPrint, User, Activity, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlert } from '../../contexts/AlertContext';

const SPECIES_OPTIONS = ['Chó', 'Mèo', 'Thỏ', 'Hamster', 'Chim', 'Khác'];

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [users, setUsers] = useState([]); // Danh sách user để chọn chủ
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({
    name: '', species: 'Chó', customSpecies: '', breed: '', age: '', weightKg: '', medicalHistory: '', ownerId: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState('Tất cả');
  const { showAlert, showConfirm } = useAlert();

  const token = JSON.parse(sessionStorage.getItem('user') || 'null')?.token;

  const fetchPets = async () => {
    try {
      const res = await axios.get('/api/pets', { headers: { Authorization: `Bearer ${token}` } });
      setPets(res.data);
      setFiltered(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data.filter(u => u.role === 'customer'));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchPets();
    fetchUsers();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(pets.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(q) ||
        p.species.toLowerCase().includes(q) ||
        (p.breed || '').toLowerCase().includes(q) ||
        (p.ownerId?.fullName || '').toLowerCase().includes(q);
      
      let matchCat = true;
      if (category !== 'Tất cả') {
        if (category === 'Khác') {
          matchCat = !['Chó', 'Mèo', 'Thỏ', 'Hamster', 'Chim'].includes(p.species);
        } else {
          matchCat = p.species === category;
        }
      }
      return matchSearch && matchCat;
    }));
  }, [search, pets, category]);

  const openModal = (pet = null) => {
    if (pet) {
      setEditingPet(pet);
      setFormData({
        name: pet.name, species: pet.species, customSpecies: '',
        breed: pet.breed || '', age: pet.age || '', weightKg: pet.weightKg || '',
        medicalHistory: pet.medicalHistory ? pet.medicalHistory.join('\n') : '',
        ownerId: pet.ownerId?._id || pet.ownerId || ''
      });
    } else {
      setEditingPet(null);
      setFormData({ name: '', species: 'Chó', customSpecies: '', breed: '', age: '', weightKg: '', medicalHistory: '', ownerId: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const finalSpecies = formData.species === 'Khác' ? (formData.customSpecies.trim() || 'Khác') : formData.species;
    const payload = {
      name: formData.name,
      species: finalSpecies,
      breed: formData.breed,
      age: formData.age,
      weightKg: formData.weightKg,
      medicalHistory: formData.medicalHistory.split('\n').filter(h => h.trim()),
      ...(formData.ownerId && { ownerId: formData.ownerId })
    };
    try {
      if (editingPet) {
        await axios.put(`/api/pets/${editingPet._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('/api/pets', payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      setIsModalOpen(false);
      fetchPets();
      showAlert('Thành công', editingPet ? 'Đã cập nhật thú cưng' : 'Đã thêm thú cưng', 'success');
    } catch (err) {
      showAlert('Lỗi', err.response?.data?.message || 'Lỗi lưu thú cưng', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    showConfirm('Xác nhận xóa', 'Xóa thú cưng này?', async () => {
      try {
        await axios.delete(`/api/pets/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchPets();
        showAlert('Thành công', 'Đã xóa thú cưng', 'success');
      } catch { 
        showAlert('Lỗi', 'Lỗi xóa', 'error'); 
      }
    });
  };

  const speciesEmoji = (s) => {
    const map = { 'Chó': '🐕', 'Mèo': '🐈', 'Thỏ': '🐇', 'Hamster': '🐹', 'Chim': '🐦' };
    return map[s] || '🐾';
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Bento */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Hồ sơ Thú cưng</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">{pets.length} thú cưng đã đăng ký</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary w-full sm:w-auto py-2.5 px-6 text-sm font-bold flex items-center justify-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/30 transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Thêm thú cưng
        </button>
      </div>

      {/* Search and Tabs */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm space-y-4">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 py-3 ring-1 ring-slate-200 dark:ring-white/5 focus-within:ring-teal-500 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, loài, giống hoặc chủ sở hữu..."
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
          />
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {['Tất cả', 'Chó', 'Mèo', 'Thỏ', 'Hamster', 'Chim', 'Khác'].map(cat => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                  isActive ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'Tất cả' ? 'Tất cả' : `${speciesEmoji(cat)} ${cat}`}
              </button>
            );
          })}
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
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Thú cưng</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Loài / Giống</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Chủ sở hữu</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Tuổi / Cân nặng</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Lịch sử bệnh án</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map(p => (
                  <tr key={p._id} onClick={() => openModal(p)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          {speciesEmoji(p.species)}
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{p.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{p.species}</span>
                      {p.breed && <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mt-1">{p.breed}</span>}
                    </td>
                    <td className="py-4 px-6">
                      {p.ownerId?.fullName ? (
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{p.ownerId.fullName}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{p.ownerId.email}</p>
                        </div>
                      ) : <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chưa xác định</span>}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        {p.age ? <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">{p.age} tuổi</span> : <span className="text-slate-400">—</span>}
                        {p.weightKg && <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">{p.weightKg} kg</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {p.medicalHistory && p.medicalHistory.length > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                          <Activity className="w-3 h-3" /> {p.medicalHistory.length} mục
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Chưa có</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button onClick={e => { e.stopPropagation(); openModal(p); }} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-xl transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(p._id); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-16 text-slate-500 dark:text-slate-400 font-medium text-sm">Không tìm thấy thú cưng nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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
              className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-slate-200 dark:ring-white/10"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-3xl">
                    {speciesEmoji(formData.species)}
                  </div>
                  <h3 className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
                    {editingPet ? `Chỉnh sửa: ${editingPet.name}` : 'Thêm thú cưng mới'}
                  </h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-5">
                {/* Owner selector (chỉ khi tạo mới) */}
                {!editingPet && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl ring-1 ring-slate-200 dark:ring-white/5 mb-6">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      <User className="w-4 h-4 inline mr-1" /> Chủ sở hữu *
                    </label>
                    <select
                      required
                      value={formData.ownerId}
                      onChange={e => setFormData({ ...formData, ownerId: e.target.value })}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    >
                      <option value="">-- Chọn khách hàng --</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tên *</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" placeholder="Tên thú cưng" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Loài *</label>
                    <select
                      required value={formData.species}
                      onChange={e => setFormData({ ...formData, species: e.target.value, customSpecies: '' })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    >
                      {SPECIES_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {formData.species === 'Khác' && (
                      <input
                        type="text" required
                        placeholder="Nhập tên loài..."
                        value={formData.customSpecies}
                        onChange={e => setFormData({ ...formData, customSpecies: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all mt-2"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Giống</label>
                    <input type="text" value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" placeholder="VD: Poodle" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tuổi (năm)</label>
                    <input type="number" min="0" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Cân nặng (kg)</label>
                    <input type="number" step="0.1" min="0" value={formData.weightKg} onChange={e => setFormData({ ...formData, weightKg: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" />
                  </div>
                </div>
                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Lịch sử bệnh án (mỗi dòng 1 mục)</label>
                  <textarea
                    rows="4" value={formData.medicalHistory}
                    onChange={e => setFormData({ ...formData, medicalHistory: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none"
                    placeholder={"- 12/10/2024: Tiêm phòng dại\n- 05/11/2024: Khám viêm da"}
                  />
                </div>
                <div className="flex gap-3 pt-6 mt-2 border-t border-slate-100 dark:border-white/5">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95">
                    Hủy
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100">
                    {saving ? 'Đang lưu...' : (editingPet ? 'Cập nhật' : 'Thêm thú cưng')}
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
