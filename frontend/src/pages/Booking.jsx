import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CalendarDays, Clock, CheckCircle, ChevronRight, Trash2, MapPin, Check, ChevronLeft, CreditCard, Activity } from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';
import { useBooking } from '../contexts/BookingContext';

const TIME_SLOTS = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'];
const STEPS = ['Thú cưng', 'Dịch vụ', 'Xác nhận'];

export default function Booking() {
  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [pets, setPets] = useState([]);
  const { cart, addToCart, removeFromCart, totalAmount, location, changeLocation, clearCart } = useBooking();
  const [bookingData, setBookingData] = useState({ petId: '', date: '', timeSlot: '09:00 - 10:00', reason: '', homeAddress: '' });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useAlert();
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');

  const speciesEmoji = (s) => {
    const map = { 'Chó': '🐕', 'Mèo': '🐈', 'Thỏ': '🐇', 'Hamster': '🐹', 'Chim': '🐦' };
    return map[s] || '🐾';
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchServices();
    fetchPets();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get('/api/services', { headers: { Authorization: `Bearer ${user.token}` } });
      setServices(res.data.map(s => ({ 
        name: s.name, price: s.basePrice || 0, emoji: s.emoji || '🩺',
        description: s.description || 'Không có mô tả chi tiết.',
        homeServiceAvailable: s.homeServiceAvailable || false,
        clinicServiceAvailable: s.clinicServiceAvailable !== undefined ? s.clinicServiceAvailable : true
      })));
    } catch (e) { console.error(e); }
  };

  const fetchPets = async () => {
    try {
      const res = await axios.get('/api/pets/my-pets', { headers: { Authorization: `Bearer ${user.token}` } });
      setPets(res.data);
      if (res.data.length > 0 && !bookingData.petId) setBookingData(prev => ({ ...prev, petId: res.data[0]._id }));
    } catch (error) { console.error(error); }
  };

  const handleLocationTab = (loc) => {
    if (cart.length > 0 && loc !== location) {
      showConfirm('Xác nhận đổi địa điểm', 'Đổi địa điểm sẽ làm trống giỏ hàng dịch vụ hiện tại. Bạn có chắc chắn?', () => {
        changeLocation(loc);
      });
    } else {
      changeLocation(loc);
    }
  };

  const handleBooking = async () => {
    setLoading(true);
    try {
      await axios.post('/api/appointments', {
        petId: bookingData.petId,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        services: cart,
        reason: bookingData.reason,
        serviceLocation: location,
        homeAddress: location === 'home' ? bookingData.homeAddress : undefined,
        estimatedPrice: totalAmount
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setStep(3);
      clearCart();
    } catch (err) {
      showAlert('Lỗi', err.response?.data?.message || 'Lỗi đặt lịch.', 'error');
    } finally { setLoading(false); }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  if (step === 3) return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-50 dark:bg-[#15171c]">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-[#1e2028] p-10 rounded-3xl text-center shadow-xl max-w-md w-full border border-slate-100 dark:border-white/5">
        <div className="w-24 h-24 bg-brand-100 dark:bg-brand-500/20 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Đặt lịch thành công!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Chúng tôi sẽ sớm liên hệ để xác nhận lịch hẹn của bạn.</p>
        <button onClick={() => navigate('/my-appointments')} className="btn-primary w-full py-3">Xem lịch hẹn của tôi</button>
      </motion.div>
    </div>
  );

  const minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#15171c] py-8 sm:py-12 px-4 transition-colors">
      <div className="max-w-4xl mx-auto">
        
        {/* Progress Bar */}
        <div className="mb-10 max-w-2xl mx-auto px-4">
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 top-5 -translate-y-1/2 w-full h-1.5 bg-slate-200 dark:bg-white/5 z-0 rounded-full"></div>
            <div className="absolute left-0 top-5 -translate-y-1/2 h-1.5 bg-brand-500 rounded-full transition-all duration-500 z-0" style={{ width: `${(step / 2) * 100}%` }}></div>
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-3 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${step >= i ? 'bg-gradient-to-tr from-brand-500 to-brand-400 text-white shadow-xl shadow-brand-500/40 scale-110' : 'bg-white dark:bg-[#1e2028] text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-white/10'}`}>
                  {step > i ? <Check className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`text-sm font-bold transition-colors ${step >= i ? 'text-brand-700 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.3 }} className="bg-white dark:bg-[#1e2028] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-white/5">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Chọn thú cưng</h2>
                  
                  {pets.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-slate-500 dark:text-slate-400 mb-4">Bạn chưa có thú cưng nào.</p>
                      <button onClick={() => navigate('/my-pets')} className="btn-primary">Thêm thú cưng ngay</button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                        {pets.map((pet, idx) => {
                          const isSelected = bookingData.petId === pet._id;
                          return (
                            <motion.div
                              key={pet._id}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={() => setBookingData(prev => ({...prev, petId: pet._id}))}
                              className={`rounded-3xl border-2 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col relative ${isSelected ? 'border-brand-500 shadow-glow-brand scale-[1.02] ring-4 ring-brand-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-brand-300'}`}
                            >
                              {isSelected && (
                                <div className="absolute top-4 right-4 z-20 w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-glow-brand">
                                  <Check className="w-5 h-5" />
                                </div>
                              )}
                              {/* Card Header */}
                              <div className={`p-4 relative overflow-hidden transition-colors ${isSelected ? 'bg-brand-900' : 'bg-slate-900'}`}>
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-6xl transform rotate-12 translate-x-4 -translate-y-4">
                                  {speciesEmoji(pet.species)}
                                </div>
                                <div className="relative z-10 flex items-center gap-3">
                                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm border border-white/20">
                                    {speciesEmoji(pet.species)}
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-bold text-white">{pet.name}</h3>
                                    <p className="text-blue-200 text-sm font-medium">{pet.species} {pet.breed ? `• ${pet.breed}` : ''}</p>
                                  </div>
                                </div>
                              </div>
                              {/* Card Body */}
                              <div className={`p-4 flex-1 flex flex-col gap-4 transition-colors ${isSelected ? 'bg-brand-50 dark:bg-brand-900/10' : 'bg-white dark:bg-slate-800'}`}>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-white dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                                    <p className="text-[11px] text-slate-400 mb-0.5">Tuổi</p>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{pet.age ? `${pet.age} tuổi` : '—'}</p>
                                  </div>
                                  <div className="bg-white dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                                    <p className="text-[11px] text-slate-400 mb-0.5">Cân nặng</p>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{pet.weightKg ? `${pet.weightKg} kg` : '—'}</p>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-widest">
                                    <Activity className="w-3.5 h-3.5 text-blue-500" /> Bệnh án & Lưu ý
                                  </p>
                                  {pet.medicalHistory && pet.medicalHistory.length > 0 ? (
                                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-4 list-disc marker:text-blue-300 line-clamp-3">
                                      {pet.medicalHistory.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                  ) : (
                                    <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-white/5 p-2 rounded-lg">Chưa có ghi chú y tế nào.</p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                      <div className="pt-6 flex justify-center">
                        <button onClick={() => navigate('/my-pets')} className="text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1 text-sm">
                          <Plus className="w-4 h-4" /> Thêm thú cưng mới
                        </button>
                      </div>
                    </>
                  )}

                  <div className="mt-8 flex justify-end">
                    <button disabled={!bookingData.petId} onClick={() => setStep(1)} className="btn-primary px-8 py-3 flex items-center gap-2">
                      Tiếp theo <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.3 }} className="bg-white dark:bg-[#1e2028] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-white/5">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Địa điểm & Dịch vụ</h2>
                  
                  {/* Location Tabs */}
                  <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl mb-6">
                    <button onClick={() => handleLocationTab('clinic')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${location === 'clinic' ? 'bg-white dark:bg-[#15171c] text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                      🏥 Tại phòng khám
                    </button>
                    <button onClick={() => handleLocationTab('home')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${location === 'home' ? 'bg-white dark:bg-[#15171c] text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                      🏠 Tại nhà
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                    {services.filter(s => location === 'clinic' ? s.clinicServiceAvailable : s.homeServiceAvailable).map((svc, idx) => {
                      const inCart = cart.find(i => i.name === svc.name);
                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={svc.name} 
                          onClick={() => inCart ? removeFromCart(svc.name) : addToCart(svc)}
                          className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex justify-between items-center shadow-sm hover:shadow-md ${inCart ? 'border-brand-500 bg-gradient-to-r from-brand-50/80 to-brand-100/80 dark:from-brand-900/30 dark:to-brand-800/30 shadow-glow-brand scale-[1.02] ring-4 ring-brand-500/10' : 'border-slate-100 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-800'}`}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-colors ${inCart ? 'bg-white dark:bg-brand-950' : 'bg-slate-100 dark:bg-slate-800'}`}>
                              {svc.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate" title={svc.name}>{svc.name}</h4>
                              <p className="text-brand-600 dark:text-brand-400 font-bold text-sm mt-0.5">{svc.price.toLocaleString()}đ</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button 
                                onClick={(e) => { e.stopPropagation(); showAlert(svc.name, svc.description, 'info'); }} 
                                className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-colors shadow-sm hover:shadow"
                              >
                                i
                              </button>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${inCart ? 'bg-brand-500 text-white shadow-glow-brand' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                {inCart ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  <div className="mt-8 flex justify-between items-center">
                    <button onClick={() => setStep(0)} className="text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-white flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" /> Quay lại
                    </button>
                    <button disabled={cart.length === 0} onClick={() => setStep(2)} className="btn-primary px-8 py-3 flex items-center gap-2">
                      Tiếp theo <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.3 }} className="bg-white dark:bg-[#1e2028] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-white/5">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Thời gian & Thông tin</h2>
                  
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ngày hẹn</label>
                        <div className="relative">
                          <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="date" min={minDate} className="input-field pl-12" value={bookingData.date} onChange={e => setBookingData({...bookingData, date: e.target.value})} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Khung giờ</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <select className="input-field pl-12" value={bookingData.timeSlot} onChange={e => setBookingData({...bookingData, timeSlot: e.target.value})}>
                            {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Lý do / Triệu chứng</label>
                      <textarea className="input-field min-h-[100px]" placeholder="Mô tả tình trạng thú cưng của bạn..." value={bookingData.reason} onChange={e => setBookingData({...bookingData, reason: e.target.value})} />
                    </div>

                    {location === 'home' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Địa chỉ nhà</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input className="input-field pl-12" placeholder="Số nhà, tên đường, phường/xã..." value={bookingData.homeAddress} onChange={e => setBookingData({...bookingData, homeAddress: e.target.value})} />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-100 dark:border-white/5">
                    <button onClick={() => setStep(1)} className="text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-white flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" /> Quay lại
                    </button>
                    <button 
                      onClick={handleBooking} 
                      disabled={loading || !bookingData.date || !bookingData.reason || (location === 'home' && !bookingData.homeAddress)} 
                      className="btn-primary px-8 py-3 flex items-center gap-2"
                    >
                      {loading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'} <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart Sidebar */}
          {step > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-80 shrink-0">
              <div className="bg-white dark:bg-[#1e2028] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/5 sticky top-24">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-500" /> Giỏ dịch vụ
                </h3>
                
                {cart.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">
                    Chưa có dịch vụ nào được chọn.
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    <AnimatePresence>
                      {cart.map(item => (
                        <motion.div key={item.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }} 
                          className="flex justify-between items-start group">
                          <div className="flex-1 pr-3">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug">{item.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.price.toLocaleString()}đ</p>
                          </div>
                          {step === 1 && (
                            <button onClick={() => removeFromCart(item.name)} className="text-slate-400 hover:text-red-500 transition-colors p-1 md:opacity-0 md:group-hover:opacity-100">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Tổng tạm tính</span>
                  <span className="text-lg font-bold text-brand-600 dark:text-brand-400">{totalAmount.toLocaleString()}đ</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
      </div>
    </div>
  );
}