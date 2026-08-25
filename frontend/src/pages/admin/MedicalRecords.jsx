import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAlert } from '../../contexts/AlertContext';
import { FileText, Plus, Search, CheckCircle, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [completedApts, setCompletedApts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);

  // Form states
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const { showAlert } = useAlert();

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(sessionStorage.getItem('user'))?.token;
      const headers = { Authorization: `Bearer ${token}` };

      const [recordsRes, aptsRes] = await Promise.all([
        axios.get('/api/medical-records', { headers }),
        axios.get('/api/appointments', { headers })
      ]);

      setRecords(recordsRes.data);

      // Find completed appointments that don't have a record yet
      const existingRecordAptIds = recordsRes.data.map(r => r.appointmentId?._id);
      const eligibleApts = aptsRes.data.filter(a => 
        a.status === 'completed' && !existingRecordAptIds.includes(a._id)
      );
      
      setCompletedApts(eligibleApts);
    } catch (error) {
      console.error(error);
      showAlert('Lỗi', 'Không thể tải dữ liệu bệnh án', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = (apt) => {
    setSelectedApt(apt);
    setDiagnosis('');
    setTreatment('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim() || !treatment.trim()) {
      return showAlert('Lỗi', 'Vui lòng nhập Chẩn đoán và Hướng xử lý', 'warning');
    }

    setSaving(true);
    try {
      const token = JSON.parse(sessionStorage.getItem('user'))?.token;
      await axios.post('/api/medical-records', {
        appointmentId: selectedApt._id,
        diagnosis,
        treatment,
        notes
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      showAlert('Thành công', 'Đã lưu bệnh án và cập nhật hồ sơ thú cưng', 'success');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      showAlert('Lỗi', error.response?.data?.message || 'Lỗi khi lưu bệnh án', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredRecords = records.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.appointmentId?.petId?.name?.toLowerCase().includes(q) ||
           r.appointmentId?.userId?.fullName?.toLowerCase().includes(q) ||
           r.diagnosis.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header Bento */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Hồ sơ Bệnh án</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Quản lý lịch sử khám chữa bệnh của thú cưng</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 py-3 ring-1 ring-slate-200 dark:ring-white/5 w-full md:w-80 focus-within:ring-teal-500 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tên thú cưng, chủ, hoặc chẩn đoán..."
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Lịch hẹn chờ tạo bệnh án */}
      {completedApts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-500/5 ring-1 ring-amber-200 dark:ring-amber-500/20 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-amber-900 dark:text-amber-300">Cần cập nhật bệnh án ({completedApts.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {completedApts.map(apt => (
              <div key={apt._id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl ring-1 ring-slate-200/50 dark:ring-white/5 shadow-sm flex justify-between items-center group hover:ring-amber-300 dark:hover:ring-amber-500/50 transition-all">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{apt.petId?.name} <span className="font-medium text-slate-500 dark:text-slate-400 text-sm ml-1">({apt.petId?.species})</span></p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-2">{apt.date} • {apt.services?.map(s => s.name).join(', ') || apt.service}</p>
                </div>
                <button 
                  onClick={() => handleOpenCreate(apt)}
                  className="bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30 text-amber-700 dark:text-amber-400 p-3 rounded-xl transition-all active:scale-95 group-hover:shadow-md"
                  title="Tạo bệnh án"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danh sách bệnh án */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-white/10 overflow-hidden">

        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">Đang tải dữ liệu...</div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/50">
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Ngày khám</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Thú cưng / Chủ</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Chẩn đoán</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Hướng xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredRecords.map(record => (
                  <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-4 px-6 align-top">
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{record.appointmentId?.date}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{record.appointmentId?.timeSlot}</p>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <p className="font-bold text-teal-700 dark:text-teal-400">{record.appointmentId?.petId?.name} <span className="font-medium text-slate-500 dark:text-slate-400 ml-1">({record.appointmentId?.petId?.species})</span></p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1.5">Khách: {record.appointmentId?.userId?.fullName}</p>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <p className="text-slate-700 dark:text-slate-300 line-clamp-3 font-medium leading-relaxed" title={record.diagnosis}>{record.diagnosis}</p>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <p className="text-slate-600 dark:text-slate-400 line-clamp-3 font-medium leading-relaxed" title={record.treatment}>{record.treatment}</p>
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-16 text-center text-slate-500 dark:text-slate-400 font-medium text-sm">
                      Không tìm thấy bệnh án nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tạo Bệnh Án */}
      {/* Modal Tạo Bệnh Án */}
      <AnimatePresence>
        {isModalOpen && selectedApt && (
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
              className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col ring-1 ring-slate-200 dark:ring-white/10"
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50 flex justify-between items-center">
                <h3 className="font-black text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Tạo Bệnh Án
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRecord} className="p-6 space-y-5 custom-scrollbar overflow-y-auto max-h-[75vh]">
                <div className="bg-teal-50 dark:bg-teal-500/10 ring-1 ring-teal-200 dark:ring-teal-500/30 p-5 rounded-2xl">
                  <p className="font-black text-lg text-teal-900 dark:text-teal-400">{selectedApt.petId?.name}</p>
                  <p className="text-sm font-medium text-teal-700 dark:text-teal-300 mt-1">Dịch vụ: {selectedApt.services?.map(s => s.name).join(', ') || selectedApt.service}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-500 mt-2">Ngày: {selectedApt.date}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Chẩn đoán <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows="3"
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none"
                    placeholder="Nhập tình trạng sức khỏe, kết quả khám..."
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Hướng xử lý / Thuốc <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows="3"
                    value={treatment}
                    onChange={e => setTreatment(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none"
                    placeholder="Nhập loại thuốc, phác đồ điều trị..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Ghi chú thêm (Tùy chọn)</label>
                  <textarea
                    rows="2"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none"
                    placeholder="Dặn dò tái khám..."
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95">
                    Hủy
                  </button>
                  <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100">
                    {saving ? 'Đang lưu...' : 'Lưu & Đồng bộ'}
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
