import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PawPrint, Edit2, Trash2, Plus, X, Activity, FileText, ChevronRight, CalendarDays } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAlert } from '../contexts/AlertContext';

const SPECIES_OPTIONS = ['Chó', 'Mèo', 'Thỏ', 'Hamster', 'Chim', 'Khác'];

const getUser = () => {
  try { return JSON.parse(sessionStorage.getItem('user') || 'null'); }
  catch { return null; }
};

export default function MyPets() {
  const [pets, setPets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({
    name: '', species: 'Chó', customSpecies: '', breed: '', age: '', weightKg: '', medicalHistory: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState('Tất cả');
  const { showAlert, showConfirm } = useAlert();
  const navigate = useNavigate();
  
  const user = getUser();

  useEffect(() => {
    if (!user) { window.location.href = '/login'; return; }
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const res = await axios.get('/api/pets/my-pets', { headers: { Authorization: `Bearer ${user.token}` } });
      setPets(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (pet = null) => {
    if (pet) {
      setEditingPet(pet);
      setFormData({
        name: pet.name, 
        species: SPECIES_OPTIONS.includes(pet.species) ? pet.species : 'Khác', 
        customSpecies: SPECIES_OPTIONS.includes(pet.species) ? '' : pet.species,
        breed: pet.breed || '', 
        age: pet.age || '', 
        weightKg: pet.weightKg || '',
        medicalHistory: pet.medicalHistory ? pet.medicalHistory.join('\n') : ''
      });
    } else {
      setEditingPet(null);
      setFormData({ name: '', species: 'Chó', customSpecies: '', breed: '', age: '', weightKg: '', medicalHistory: '' });
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
      medicalHistory: formData.medicalHistory.split('\n').filter(h => h.trim())
    };
    try {
      if (editingPet) {
        await axios.put(`/api/pets/${editingPet._id}`, payload, { headers: { Authorization: `Bearer ${user.token}` } });
      } else {
        await axios.post('/api/pets', payload, { headers: { Authorization: `Bearer ${user.token}` } });
      }
      setIsModalOpen(false);
      fetchPets();
      showAlert('Thành công', editingPet ? 'Cập nhật hồ sơ thành công' : 'Thêm hồ sơ thú cưng thành công', 'success');
    } catch (err) {
      showAlert('Lỗi', err.response?.data?.message || 'Lỗi lưu hồ sơ thú cưng', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    showConfirm('Xác nhận xóa', 'Xóa hồ sơ thú cưng này? Hành động này không thể hoàn tác.', async () => {
      try {
        await axios.delete(`/api/pets/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
        fetchPets();
        showAlert('Thành công', 'Đã xóa hồ sơ thú cưng', 'success');
      } catch { 
        showAlert('Lỗi', 'Lỗi xóa thú cưng', 'error'); 
      }
    });
  };

  const speciesEmoji = (s) => {
    const map = { 'Chó': '🐕', 'Mèo': '🐈', 'Thỏ': '🐇', 'Hamster': '🐹', 'Chim': '🐦' };
    return map[s] || '🐾';
  };

  if (loading) return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-16 px-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-slate-200" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-16 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Thú cưng của tôi</h1>
            <p className="text-slate-500 mt-1">
              {pets.length > 0
                ? `Bạn đang quản lý hồ sơ của ${pets.length} bé`
                : 'Thêm hồ sơ thú cưng để dễ dàng đặt lịch khám'}
            </p>
          </div>
          <div className="flex gap-3 self-start">
            <button onClick={() => navigate('/booking')} className="btn-secondary py-2.5 px-5 text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Đặt lịch khám
            </button>
            <button onClick={() => openModal()} className="btn-primary py-2.5 px-5 text-sm font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" /> Thêm thú cưng
            </button>
          </div>
        </div>

        {pets.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <PawPrint className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <p className="text-xl font-semibold text-slate-700 mb-2">Chưa có hồ sơ thú cưng</p>
            <p className="text-slate-400 text-sm mb-6">Tạo hồ sơ ngay để theo dõi sức khỏe và lịch sử khám</p>
            <button onClick={() => openModal()} className="btn-primary py-2.5 px-8">
              Thêm mới ngay <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
              {['Tất cả', 'Chó', 'Mèo', 'Thỏ', 'Hamster', 'Chim', 'Khác'].map(cat => {
                const isActive = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      isActive ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat === 'Tất cả' ? 'Tất cả' : `${speciesEmoji(cat)} ${cat}`}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets
                .filter(pet => {
                  if (category === 'Tất cả') return true;
                  if (category === 'Khác') return !['Chó', 'Mèo', 'Thỏ', 'Hamster', 'Chim'].includes(pet.species);
                  return pet.species === category;
                })
                .map((pet, idx) => (
              <motion.div
                key={pet._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div className="bg-slate-900 p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-6xl transform rotate-12 translate-x-4 -translate-y-4">
                    {speciesEmoji(pet.species)}
                  </div>
                  <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm border border-white/20">
                        {speciesEmoji(pet.species)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{pet.name}</h3>
                        <p className="text-blue-200 text-sm font-medium">{pet.species} {pet.breed ? `• ${pet.breed}` : ''}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-400 mb-0.5">Tuổi</p>
                      <p className="font-semibold text-slate-800">{pet.age ? `${pet.age} tuổi` : '—'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-400 mb-0.5">Cân nặng</p>
                      <p className="font-semibold text-slate-800">{pet.weightKg ? `${pet.weightKg} kg` : '—'}</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5 uppercase tracking-widest">
                      <Activity className="w-3.5 h-3.5 text-blue-500" /> Bệnh án & Lưu ý
                    </p>
                    {pet.medicalHistory && pet.medicalHistory.length > 0 ? (
                      <ul className="text-sm text-slate-600 space-y-1.5 pl-5 list-disc marker:text-blue-300">
                        {pet.medicalHistory.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-400 italic bg-slate-50 p-3 rounded-xl">Chưa có ghi chú y tế nào.</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                  <button onClick={() => navigate('/booking')} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition">
                    <CalendarDays className="w-4 h-4" /> Đặt lịch
                  </button>
                  <div className="w-px bg-slate-200 my-2" />
                  <button onClick={() => openModal(pet)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
                    <Edit2 className="w-4 h-4" /> Cập nhật
                  </button>
                  <div className="w-px bg-slate-200 my-2" />
                  <button onClick={() => handleDelete(pet._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
                    <Trash2 className="w-4 h-4" /> Xóa
                  </button>
                </div>
              </motion.div>
            ))}
            </div>
            {pets.filter(pet => {
              if (category === 'Tất cả') return true;
              if (category === 'Khác') return !['Chó', 'Mèo', 'Thỏ', 'Hamster', 'Chim'].includes(pet.species);
              return pet.species === category;
            }).length === 0 && (
              <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
                Không tìm thấy thú cưng nào thuộc danh mục "{category}".
              </div>
            )}
          </>
        )}

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden"
              >
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <PawPrint className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">
                        {editingPet ? 'Cập nhật hồ sơ' : 'Thêm thú cưng mới'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {editingPet ? `Chỉnh sửa thông tin bé ${editingPet.name}` : 'Điền thông tin cơ bản cho bé'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên bé *</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field py-2.5" placeholder="VD: Milo" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Loài *</label>
                      <select
                        required value={formData.species}
                        onChange={e => setFormData({ ...formData, species: e.target.value, customSpecies: '' })}
                        className="input-field py-2.5"
                      >
                        {SPECIES_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {formData.species === 'Khác' && (
                        <motion.input
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          type="text" required
                          placeholder="Nhập tên loài..."
                          value={formData.customSpecies}
                          onChange={e => setFormData({ ...formData, customSpecies: e.target.value })}
                          className="input-field mt-2 py-2.5"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Giống</label>
                      <input type="text" value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} className="input-field py-2.5" placeholder="VD: Poodle" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tuổi (năm)</label>
                      <input type="number" min="0" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="input-field py-2.5" placeholder="VD: 2" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cân nặng (kg)</label>
                      <input type="number" step="0.1" min="0" value={formData.weightKg} onChange={e => setFormData({ ...formData, weightKg: e.target.value })} className="input-field py-2.5" placeholder="VD: 4.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-400" /> Bệnh án & Lưu ý (Không bắt buộc)
                    </label>
                    <textarea
                      rows="4" value={formData.medicalHistory}
                      onChange={e => setFormData({ ...formData, medicalHistory: e.target.value })}
                      className="input-field resize-none leading-relaxed"
                      placeholder={"Viết mỗi lưu ý trên một dòng:\n- Bị dị ứng hải sản\n- Đã tiêm phòng dại mũi 1"}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1 py-3 font-semibold">Hủy</button>
                    <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 font-semibold">
                      {saving ? 'Đang lưu...' : (editingPet ? 'Cập nhật' : 'Thêm thú cưng')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
