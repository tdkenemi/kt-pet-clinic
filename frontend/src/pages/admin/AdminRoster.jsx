import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAlert } from '../../contexts/AlertContext';
import { Calendar as CalendarIcon, Clock, MapPin, User, ChevronLeft, ChevronRight, UserPlus, Info, CheckCircle } from 'lucide-react';
import dayjs from 'dayjs';

export default function AdminRoster() {
  const [appointments, setAppointments] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(sessionStorage.getItem('user'));
      
      const [aptRes, staffRes] = await Promise.all([
        axios.get('/api/appointments', { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get('/api/staffs', { headers: { Authorization: `Bearer ${user.token}` } })
      ]);
      
      setAppointments(aptRes.data);
      setStaffs(staffRes.data.filter(s => s.role === 'Veterinarian' || s.role === 'Groomer'));
    } catch (error) {
      console.error(error);
      showAlert('Lỗi', 'Không thể tải dữ liệu phân công', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (apt, staffId) => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const staff = staffs.find(s => s._id === staffId);
      
      const billingDetails = {
        ...(apt.billingDetails || {}),
        vetName: staff ? staff.name : '',
        vetPhone: staff ? staff.phone : ''
      };

      const payload = {
        vetId: staffId || null,
        billingDetails
      };

      await axios.put(`/api/appointments/${apt._id}/status`, payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      showAlert('Thành công', 'Đã phân công nhân sự', 'success');
      fetchData(); // Reload
    } catch (error) {
      console.error(error);
      showAlert('Lỗi', 'Lỗi khi phân công nhân sự', 'error');
    }
  };

  const handlePrevDay = () => setCurrentDate(prev => prev.subtract(1, 'day'));
  const handleNextDay = () => setCurrentDate(prev => prev.add(1, 'day'));
  const handleToday = () => setCurrentDate(dayjs());

  const dateStr = currentDate.format('YYYY-MM-DD');
  
  // Filter active appointments for the day
  const todayApts = appointments.filter(a => a.date === dateStr && a.status !== 'cancelled');

  // Unassigned
  const unassignedApts = todayApts.filter(a => !a.vetId && !a.billingDetails?.vetName);

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
      {/* Header Bento */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Phân Công Bác Sĩ & Chuyên Viên</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Giao việc cho nhân viên và theo dõi lịch trình</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm">
          <button onClick={handlePrevDay} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors shadow-sm hover:shadow">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-4 py-2 font-black text-slate-800 dark:text-white flex items-center gap-2 min-w-[160px] justify-center tracking-tight">
            <CalendarIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {currentDate.format('DD/MM/YYYY')}
          </div>
          <button onClick={handleNextDay} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors shadow-sm hover:shadow">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={handleToday} className="px-4 py-2 ml-2 text-sm font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-500/20 transition-colors ring-1 ring-teal-200 dark:ring-teal-500/30 hidden sm:block">
            Hôm nay
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center text-slate-500">Đang tải dữ liệu phân công...</div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-6 h-full min-w-max items-start px-1">
            
            {/* Cột Chưa Phân Công */}
            <div className="w-[340px] bg-slate-50/80 dark:bg-slate-900/50 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-inner flex flex-col max-h-full">
              <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900 rounded-t-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"></div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Chờ phân công</h3>
                </div>
                <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1.5 rounded-xl ring-1 ring-amber-200 dark:ring-amber-500/30">{unassignedApts.length}</span>
              </div>
              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                {unassignedApts.map(apt => (
                  <AppointmentCard key={apt._id} apt={apt} staffs={staffs} onAssign={handleAssign} />
                ))}
                {unassignedApts.length === 0 && (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm flex flex-col items-center">
                    <CheckCircle className="w-10 h-10 text-emerald-400 dark:text-emerald-500 mb-3 opacity-50" />
                    <span className="font-bold uppercase tracking-wider">Không có lịch chờ</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cột Nhân Viên */}
            {staffs.map(staff => {
              const staffApts = todayApts.filter(a => a.vetId === staff._id || a.billingDetails?.vetName === staff.name);
              
              return (
                <div key={staff._id} className="w-[340px] bg-white dark:bg-slate-900 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm flex flex-col max-h-full">
                  <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/20 shrink-0 text-lg">
                      {staff.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate">{staff.name}</h3>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mt-0.5">{staff.role}</p>
                    </div>
                    <span className="bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 text-xs font-bold px-3 py-1.5 rounded-xl ring-1 ring-teal-200 dark:ring-teal-500/30">
                      {staffApts.length}
                    </span>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-b-3xl">
                    {staffApts.map(apt => (
                      <AppointmentCard key={apt._id} apt={apt} staffs={staffs} onAssign={handleAssign} />
                    ))}
                    {staffApts.length === 0 && (
                      <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm flex flex-col items-center">
                        <CalendarIcon className="w-10 h-10 mb-3 opacity-30" />
                        <span className="font-bold uppercase tracking-wider">Trống lịch</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ apt, staffs, onAssign }) {
  return (
    <div className={`p-4 rounded-2xl ring-1 relative group transition-all shadow-sm hover:shadow-md ${apt.status === 'completed' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 ring-emerald-200 dark:ring-emerald-500/20' : 'bg-white dark:bg-slate-900 ring-slate-200 dark:ring-white/10 hover:ring-teal-300 dark:hover:ring-teal-500/50'}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${apt.status === 'completed' ? 'bg-emerald-400 dark:bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} />
      
      <div className="flex justify-between items-start mb-3 pl-3">
        <span className="font-bold text-teal-700 dark:text-teal-400 text-sm flex items-center gap-1.5">
          <Clock className="w-4 h-4" /> {apt.timeSlot}
        </span>
        {apt.status === 'completed' && (
          <span className="text-[10px] uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-lg font-bold ring-1 ring-emerald-200 dark:ring-emerald-500/30">Xong</span>
        )}
      </div>
      
      <div className="pl-3 mb-4">
        <p className="font-bold text-slate-900 dark:text-white text-base tracking-tight">{apt.petId?.name} <span className="font-medium text-slate-500 dark:text-slate-400 text-sm">({apt.services?.map(s => s.name).join(', ') || apt.service})</span></p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5 font-medium">
          <User className="w-4 h-4" /> {apt.userId?.fullName}
        </p>
        {apt.serviceLocation === 'home' && (
          <p className="text-[10px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg mt-2 inline-flex items-center gap-1 ring-1 ring-amber-200 dark:ring-amber-500/30">
            <MapPin className="w-3 h-3" /> Tại nhà
          </p>
        )}
      </div>

      <div className="pl-3 pt-4 border-t border-slate-100 dark:border-white/5">
        <select 
          value={apt.vetId || ''} 
          onChange={(e) => onAssign(apt, e.target.value)}
          className="w-full text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl px-3 py-2.5 outline-none focus:ring-teal-500 transition-all cursor-pointer"
        >
          <option value="">-- Giao việc cho --</option>
          {staffs.map(s => (
            <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
          ))}
        </select>
      </div>
    </div>
  );
}
