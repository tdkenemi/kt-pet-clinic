import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PawPrint, Edit2, Trash2, Plus, X, Activity, FileText,
  ChevronRight, CalendarDays, Camera, Upload, ZoomIn,
  Venus, Mars, HelpCircle, Cpu, Syringe
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAlert } from '../contexts/AlertContext';

const SPECIES_OPTIONS = ['Chó', 'Mèo', 'Thỏ', 'Hamster', 'Chim', 'Khác'];
const GENDER_OPTIONS = [
  { value: 'male', label: 'Đực', icon: Mars },
  { value: 'female', label: 'Cái', icon: Venus },
  { value: 'unknown', label: 'Chưa biết', icon: HelpCircle },
];

const getUser = () => {
  try { return JSON.parse(sessionStorage.getItem('user') || 'null'); }
  catch { return null; }
};

const speciesEmoji = (s) => {
  const map = { 'Chó': '🐕', 'Mèo': '🐈', 'Thỏ': '🐇', 'Hamster': '🐹', 'Chim': '🐦' };
  return map[s] || '🐾';
};

export default function MyPets() {
  const [pets, setPets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({
    name: '', species: 'Chó', customSpecies: '', breed: '', age: '', weightKg: '',
    medicalHistory: '', gender: 'unknown', color: '', microchipId: '',
    image: '', gallery: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState('Tất cả');
  const [lightboxImg, setLightboxImg] = useState(null);
  const avatarInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [vaccinationModal, setVaccinationModal] = useState({ isOpen: false, petId: null, petName: '', data: [], loading: false });
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

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showAlert('Lỗi', 'Vui lòng chọn file ảnh', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showAlert('Lỗi', 'Ảnh không được vượt quá 5MB', 'error'); return; }
    const base64 = await toBase64(file);
    setFormData(prev => ({ ...prev, image: base64 }));
  };

  const handleGalleryChange = async (e) => {
    const files = Array.from(e.target.files);
    const remaining = 5 - formData.gallery.length;
    const selected = files.slice(0, remaining);
    const encoded = await Promise.all(selected.map(toBase64));
    setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...encoded].slice(0, 5) }));
  };

  const removeGalleryImg = (idx) => {
    setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }));
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
        medicalHistory: pet.medicalHistory ? pet.medicalHistory.join('\n') : '',
        gender: pet.gender || 'unknown',
        color: pet.color || '',
        microchipId: pet.microchipId || '',
        image: pet.image || '',
        gallery: pet.gallery || []
      });
    } else {
      setEditingPet(null);
      setFormData({
        name: '', species: 'Chó', customSpecies: '', breed: '', age: '', weightKg: '',
        medicalHistory: '', gender: 'unknown', color: '', microchipId: '', image: '', gallery: []
      });
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
      gender: formData.gender,
      color: formData.color,
      microchipId: formData.microchipId,
      image: formData.image,
      gallery: formData.gallery,
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

  const openVaccinationModal = async (pet) => {
    setVaccinationModal({ isOpen: true, petId: pet._id, petName: pet.name, data: [], loading: true });
    try {
      const res = await axios.get(`/api/vaccinations/pet/${pet._id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setVaccinationModal(prev => ({ ...prev, data: res.data, loading: false }));
    } catch (error) {
      showAlert('Lỗi', 'Không thể lấy dữ liệu tiêm phòng', 'error');
      setVaccinationModal(prev => ({ ...prev, loading: false }));
    }
  };

  const genderBadge = (g) => {
    if (g === 'male') return <span className="text-blue-500 text-xs font-semibold flex items-center gap-0.5"><Mars className="w-3 h-3" /> Đực</span>;
    if (g === 'female') return <span className="text-pink-500 text-xs font-semibold flex items-center gap-0.5"><Venus className="w-3 h-3" /> Cái</span>;
    return null;
  };

  const filteredPets = pets.filter(pet => {
    if (category === 'Tất cả') return true;
    if (category === 'Khác') return !['Chó', 'Mèo', 'Thỏ', 'Hamster', 'Chim'].includes(pet.species);
    return pet.species === category;
  });

  if (loading) return (
    <div className="bg-slate-50 dark:bg-[#0f1115] min-h-[calc(100vh-64px)] py-16 px-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-slate-200" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 dark:bg-[#0f1115] min-h-[calc(100vh-64px)] py-16 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Thú cưng của tôi</h1>
            <p className="text-slate-500 mt-1">
              {pets.length > 0 ? `Bạn đang quản lý hồ sơ của ${pets.length} bé` : 'Thêm hồ sơ thú cưng để dễ dàng đặt lịch khám'}
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
          <div className="text-center py-24 bg-white dark:bg-[#1a1d24] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
            <PawPrint className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <p className="text-xl font-semibold text-slate-700 dark:text-white mb-2">Chưa có hồ sơ thú cưng</p>
            <p className="text-slate-400 text-sm mb-6">Tạo hồ sơ ngay để theo dõi sức khỏe và lịch sử khám</p>
            <button onClick={() => openModal()} className="btn-primary py-2.5 px-8">
              Thêm mới ngay <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
              {['Tất cả', 'Chó', 'Mèo', 'Thỏ', 'Hamster', 'Chim', 'Khác'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    category === cat
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  {cat === 'Tất cả' ? 'Tất cả' : `${speciesEmoji(cat)} ${cat}`}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPets.map((pet, idx) => (
                <motion.div
                  key={pet._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-[#1a1d24] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                >
                  {/* Card Header — ảnh đại diện */}
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                    {pet.image ? (
                      <>
                        <img
                          src={pet.image}
                          alt={pet.name}
                          className="w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                        <button
                          onClick={() => setLightboxImg(pet.image)}
                          className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 rounded-lg text-white transition"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-30">
                        <span className="text-6xl">{speciesEmoji(pet.species)}</span>
                      </div>
                    )}

                    {/* Pet name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white">{pet.name}</h3>
                          <p className="text-blue-200 text-sm">{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {pet.gender === 'male' && <span className="bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs px-2 py-0.5 rounded-lg font-medium">♂ Đực</span>}
                          {pet.gender === 'female' && <span className="bg-pink-500/20 border border-pink-400/30 text-pink-200 text-xs px-2 py-0.5 rounded-lg font-medium">♀ Cái</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                        <p className="text-xs text-slate-400 mb-0.5">Tuổi</p>
                        <p className="font-semibold text-slate-800 dark:text-white text-sm">{pet.age ? `${pet.age} tuổi` : '—'}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                        <p className="text-xs text-slate-400 mb-0.5">Cân nặng</p>
                        <p className="font-semibold text-slate-800 dark:text-white text-sm">{pet.weightKg ? `${pet.weightKg} kg` : '—'}</p>
                      </div>
                      {pet.color && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                          <p className="text-xs text-slate-400 mb-0.5">Màu lông</p>
                          <p className="font-semibold text-slate-800 dark:text-white text-sm">{pet.color}</p>
                        </div>
                      )}
                      {pet.microchipId && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                          <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1"><Cpu className="w-3 h-3" /> Microchip</p>
                          <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{pet.microchipId}</p>
                        </div>
                      )}
                    </div>

                    {/* Gallery thumbnails */}
                    {pet.gallery?.length > 0 && (
                      <div className="flex gap-1.5">
                        {pet.gallery.slice(0, 4).map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setLightboxImg(img)}
                            className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 flex-shrink-0"
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                        {pet.gallery.length > 4 && (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-500 border border-slate-200 dark:border-white/10">
                            +{pet.gallery.length - 4}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Medical history */}
                    {pet.medicalHistory?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1 uppercase tracking-widest">
                          <Activity className="w-3 h-3 text-blue-500" /> Bệnh án
                        </p>
                        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-4 list-disc marker:text-blue-300 line-clamp-3">
                          {pet.medicalHistory.slice(0, 3).map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-white/5 grid grid-cols-4 gap-1">
                    <button onClick={() => navigate('/booking')} className="flex flex-col items-center justify-center py-2 text-[10px] font-medium text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition">
                      <CalendarDays className="w-4 h-4 mb-1" /> Đặt lịch
                    </button>
                    <button onClick={() => openVaccinationModal(pet)} className="flex flex-col items-center justify-center py-2 text-[10px] font-medium text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition relative">
                      <Syringe className="w-4 h-4 mb-1" /> Tiêm phòng
                    </button>
                    <button onClick={() => openModal(pet)} className="flex flex-col items-center justify-center py-2 text-[10px] font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
                      <Edit2 className="w-4 h-4 mb-1" /> Cập nhật
                    </button>
                    <button onClick={() => handleDelete(pet._id)} className="flex flex-col items-center justify-center py-2 text-[10px] font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
                      <Trash2 className="w-4 h-4 mb-1" /> Xóa
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredPets.length === 0 && (
              <div className="text-center py-12 text-slate-400 bg-white dark:bg-[#1a1d24] rounded-2xl border border-slate-200 dark:border-white/5">
                Không tìm thấy thú cưng nào thuộc danh mục "{category}".
              </div>
            )}
          </>
        )}

        {/* ── Add/Edit Modal ── */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#1a1d24] rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh] overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <PawPrint className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {editingPet ? 'Cập nhật hồ sơ' : 'Thêm thú cưng mới'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {editingPet ? `Chỉnh sửa thông tin bé ${editingPet.name}` : 'Điền thông tin cơ bản cho bé'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">

                  {/* Avatar Upload */}
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                        {formData.image ? (
                          <img src={formData.image} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">{speciesEmoji(formData.species)}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                      <input ref={avatarInputRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ảnh đại diện</p>
                      <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, GIF · Tối đa 5MB</p>
                      {formData.image && (
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: '' }))} className="text-xs text-red-500 hover:underline mt-1">Xóa ảnh</button>
                      )}
                    </div>
                  </div>

                  {/* Tên + Loài */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tên bé *</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field py-2.5" placeholder="VD: Milo" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Loài *</label>
                      <select required value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value, customSpecies: '' })} className="input-field py-2.5">
                        {SPECIES_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {formData.species === 'Khác' && (
                        <input type="text" required placeholder="Nhập tên loài..." value={formData.customSpecies} onChange={e => setFormData({ ...formData, customSpecies: e.target.value })} className="input-field mt-2 py-2.5" />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Giống</label>
                      <input type="text" value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} className="input-field py-2.5" placeholder="VD: Poodle" />
                    </div>
                  </div>

                  {/* Giới tính */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Giới tính</label>
                    <div className="flex gap-2">
                      {GENDER_OPTIONS.map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, gender: value }))}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition border ${
                            formData.gender === value
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" /> {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tuổi + Cân nặng + Màu lông + Microchip */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tuổi (năm)</label>
                      <input type="number" min="0" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="input-field py-2.5" placeholder="VD: 2" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Cân nặng (kg)</label>
                      <input type="number" step="0.1" min="0" value={formData.weightKg} onChange={e => setFormData({ ...formData, weightKg: e.target.value })} className="input-field py-2.5" placeholder="VD: 4.5" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Màu lông</label>
                      <input type="text" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="input-field py-2.5" placeholder="VD: Vàng, Trắng..." />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1"><Cpu className="w-3.5 h-3.5" />Microchip ID</label>
                      <input type="text" value={formData.microchipId} onChange={e => setFormData({ ...formData, microchipId: e.target.value })} className="input-field py-2.5" placeholder="Số chip (nếu có)" />
                    </div>
                  </div>

                  {/* Gallery */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-slate-400" /> Album ảnh (tối đa 5 ảnh)
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {formData.gallery.map((img, i) => (
                        <div key={i} className="relative">
                          <img src={img} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-white/10" />
                          <button type="button" onClick={() => removeGalleryImg(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                        </div>
                      ))}
                      {formData.gallery.length < 5 && (
                        <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                          <Plus className="w-5 h-5 text-slate-400" />
                          <span className="text-xs text-slate-400">Thêm</span>
                          <input ref={galleryInputRef} type="file" accept="image/*" multiple className="sr-only" onChange={handleGalleryChange} />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Bệnh án */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-400" /> Bệnh án & Lưu ý (Không bắt buộc)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.medicalHistory}
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

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxImg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImg(null)}
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4 cursor-zoom-out"
            >
              <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                src={lightboxImg}
                alt=""
                className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl"
                onClick={e => e.stopPropagation()}
              />
              <button onClick={() => setLightboxImg(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition">
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vaccination Modal */}
        <AnimatePresence>
          {vaccinationModal.isOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
              >
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-emerald-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Syringe className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">Sổ tiêm phòng</h3>
                      <p className="text-xs text-slate-500">Bé {vaccinationModal.petName}</p>
                    </div>
                  </div>
                  <button onClick={() => setVaccinationModal({ isOpen: false, petId: null, petName: '', data: [], loading: false })} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                  {vaccinationModal.loading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-slate-500 text-sm">Đang tải dữ liệu...</p>
                    </div>
                  ) : vaccinationModal.data.length === 0 ? (
                    <div className="text-center py-10">
                      <Syringe className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-500">Chưa có dữ liệu tiêm phòng nào.</p>
                      <p className="text-xs text-slate-400 mt-1">Lịch sử sẽ do Bác sĩ cập nhật sau khi tiêm.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                      {vaccinationModal.data.map((v, i) => (
                        <div key={v._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          {/* Icon marker */}
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${
                            v.status === 'overdue' ? 'bg-red-500' :
                            v.status === 'upcoming' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}>
                            <Syringe className="w-4 h-4 text-white" />
                          </div>
                          
                          {/* Card */}
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-slate-800">{v.vaccineName}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                v.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                v.status === 'upcoming' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {v.status === 'overdue' ? 'Quá hạn' : v.status === 'upcoming' ? 'Sắp tới' : 'Đã tiêm'}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 space-y-1">
                              <p><b>Ngày tiêm:</b> {new Date(v.dateGiven).toLocaleDateString('vi-VN')}</p>
                              <p className={v.status === 'overdue' ? 'text-red-600 font-semibold' : ''}><b>Tiêm nhắc lại:</b> {new Date(v.nextDueDate).toLocaleDateString('vi-VN')}</p>
                              {v.vetId && <p><b>Bác sĩ:</b> {v.vetId.fullName}</p>}
                              {v.notes && <p className="italic bg-slate-50 p-2 rounded mt-2">{v.notes}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
