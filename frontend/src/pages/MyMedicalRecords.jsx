import React, { useState, useEffect } from 'react';
import { Activity, Search, Calendar, PawPrint, FileText, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function MyMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user.token) return;
      try {
        const { data } = await axios.get('/api/medical-records/my-records', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setRecords(data);
      } catch (error) {
        console.error('Lỗi lấy bệnh án:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [user.token]);

  const filteredRecords = records.filter(r => {
    const petName = r.appointmentId?.petId?.name?.toLowerCase() || '';
    const diag = (r.diagnosis || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return petName.includes(q) || diag.includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-brand-600" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hồ sơ y tế</h1>
            </div>
            <p className="text-slate-500 font-medium">Theo dõi lịch sử khám chữa bệnh của các bé</p>
          </div>

          <div className="relative w-full md:w-72 group">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm theo tên bé, hoặc chẩn đoán..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200/50 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-200 shadow-sm">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">Chưa có hồ sơ y tế</h3>
            <p className="text-slate-500">Khi thú cưng của bạn hoàn thành dịch vụ khám bệnh, hồ sơ sẽ hiển thị ở đây.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredRecords.map((record, index) => {
                const appt = record.appointmentId;
                const pet = appt?.petId;
                const vetName = appt?.vetId?.fullName || 'Không có';
                
                return (
                  <motion.div
                    key={record._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden hover:shadow-md hover:border-brand-300 transition-all group"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Left Sidebar (Date & Pet) */}
                      <div className="bg-slate-50/50 p-6 md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-4">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-sm font-bold text-slate-900">{appt?.date}</p>
                            <p className="text-xs text-slate-500 font-medium">{appt?.timeSlot}</p>
                          </div>
                        </div>

                        {pet && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                              {pet.image ? (
                                <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                              ) : (
                                <PawPrint className="w-5 h-5 text-brand-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 line-clamp-1">{pet.name}</p>
                              <p className="text-xs text-slate-500 capitalize">{pet.species} {pet.breed ? `• ${pet.breed}` : ''}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Content (Details) */}
                      <div className="p-6 flex-1">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {appt?.services?.map((s, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2.5 py-1 rounded-lg font-semibold">
                              {s.name}
                            </span>
                          ))}
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1 flex items-center gap-1.5">
                              <Stethoscope className="w-3.5 h-3.5" /> Chẩn đoán
                            </p>
                            <p className="text-sm text-slate-800 leading-relaxed font-medium">{record.diagnosis}</p>
                          </div>

                          <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                            <p className="text-xs font-bold uppercase tracking-wider text-green-800 mb-1 flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5" /> Hướng xử lý
                            </p>
                            <p className="text-sm text-slate-800 leading-relaxed">{record.treatment}</p>
                          </div>
                          
                          {record.notes && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> Ghi chú thêm
                              </p>
                              <p className="text-sm text-slate-600 leading-relaxed italic">{record.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end">
                           <p className="text-xs font-medium text-slate-400">Bác sĩ phụ trách: <span className="text-slate-700 font-bold">{vetName}</span></p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
