import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  X, TrendingUp, TrendingDown, Calendar, Users, PawPrint,
  DollarSign, ArrowRight, CheckCircle, Clock, AlertCircle, XCircle, Activity
} from 'lucide-react';

const statusMap = {
  completed: { label: 'Hoàn thành', className: 'bg-brand-500/10 text-brand-500 ring-1 ring-brand-500/20', icon: CheckCircle },
  pending: { label: 'Chờ duyệt', className: 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20', icon: Clock },
  confirmed: { label: 'Xác nhận', className: 'bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', className: 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20', icon: XCircle },
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalCompleted: 0, pendingAppointments: 0, totalPatients: 0, totalRevenue: 0, totalCancelled: 0, paid: 0, unpaid: 0 });
  const [chartDatasets, setChartDatasets] = useState({ revenue: [], completed: [], pending: [], patients: [] });
  const [activeChart, setActiveChart] = useState('revenue');
  const [recentAppointments, setRecentAppointments] = useState([]);
  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const [aptRes, petsRes, revRes] = await Promise.all([
        axios.get('/api/appointments', { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get('/api/pets', { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get('/api/appointments/revenue', { headers: { Authorization: `Bearer ${user.token}` } })
      ]);
      const appointments = aptRes.data;
      const completed = appointments.filter(a => a.status === 'completed');
      const pending = appointments.filter(a => a.status === 'pending');
      const cancelled = appointments.filter(a => a.status === 'cancelled');
      
      const paid = appointments.filter(a => a.paymentStatus === 'Paid').length;
      const unpaid = appointments.filter(a => a.paymentStatus === 'Pending' && a.status !== 'cancelled').length;

      setStats({
        totalCompleted: completed.length,
        pendingAppointments: pending.length,
        totalPatients: petsRes.data.length,
        totalRevenue: revRes.data.thisMonthRevenue || 0, // Doanh thu tháng này
        totalCancelled: cancelled.length,
        paid,
        unpaid
      });
      
      const now = new Date();
      const thisYear = now.getFullYear();
      
      const compArr = Array(12).fill(0);
      completed.forEach(a => {
        const d = new Date(a.completedAt || a.date);
        if (d.getFullYear() === thisYear) compArr[d.getMonth()]++;
      });
      
      const pendArr = Array(12).fill(0);
      appointments.forEach(a => {
        const d = new Date(a.createdAt || a.date);
        if (d.getFullYear() === thisYear) pendArr[d.getMonth()]++;
      });
      
      const patArr = Array(12).fill(0);
      petsRes.data.forEach(p => {
        const d = new Date(p.createdAt || Date.now());
        if (d.getFullYear() === thisYear) patArr[d.getMonth()]++;
      });

      setChartDatasets({
        revenue: revRes.data.byMonth || Array(12).fill(0),
        completed: compArr,
        pending: pendArr,
        patients: patArr
      });
      
      setRecentAppointments(appointments.slice(0, 8));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      id: 'completed',
      label: 'Ca hoàn thành', value: stats.totalCompleted, icon: CheckCircle,
      trend: '+12% so với tháng trước', positive: true,
      bg: 'bg-white dark:bg-slate-900', ring: 'ring-1 ring-slate-200 dark:ring-white/10',
      iconBg: 'bg-brand-500/10 text-brand-500',
    },
    {
      id: 'pending',
      label: 'Lịch chờ duyệt', value: stats.pendingAppointments, icon: Clock,
      trend: stats.pendingAppointments > 0 ? `Có ${stats.pendingAppointments} lịch mới` : 'Đã xử lý hết',
      positive: false,
      bg: 'bg-white dark:bg-slate-900', ring: 'ring-1 ring-slate-200 dark:ring-white/10',
      iconBg: 'bg-amber-500/10 text-amber-500',
    },
    {
      id: 'patients',
      label: 'Bệnh nhân', value: stats.totalPatients, icon: PawPrint,
      trend: '+18% khách hàng mới', positive: true,
      bg: 'bg-white dark:bg-slate-900', ring: 'ring-1 ring-slate-200 dark:ring-white/10',
      iconBg: 'bg-violet-500/10 text-violet-500',
    },
    {
      id: 'revenue',
      label: 'Doanh thu tháng', value: `${(stats.totalRevenue / 1000000).toFixed(1)}M`, icon: DollarSign,
      trend: `${stats.paid} đã TT / ${stats.unpaid} chưa TT`, positive: true,
      bg: 'bg-gradient-to-br from-brand-500 to-brand-600', ring: 'ring-1 ring-brand-500/50 shadow-lg shadow-brand-500/20',
      iconBg: 'bg-white/20 text-white',
      textClass: 'text-white', trendClass: 'text-brand-100'
    },
  ];

  const chartData = chartDatasets[activeChart] || Array(12).fill(0);
  const maxChart = Math.max(...chartData, 1);
  const months = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-slate-100 rounded-xl animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
      </div>
      <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Tổng quan</h1>
          <p className="page-subtitle">Hoạt động phòng khám · {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/appointments" className="btn-primary py-2 px-4 text-sm">
            <Calendar className="w-4 h-4" /> Xem lịch hẹn
          </Link>
        </div>
      </div>

      {/* Stat Cards - Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          const isDark = stat.textClass === 'text-white';
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setActiveChart(stat.id)}
              transition={{ delay: idx * 0.07, type: 'spring', stiffness: 300, damping: 30 }}
              className={`relative overflow-hidden rounded-3xl p-6 cursor-pointer ${stat.bg} ${stat.ring} transition-all duration-300 hover:scale-[1.02] group ${activeChart === stat.id ? 'ring-2 ring-brand-500 dark:ring-brand-400 scale-[1.02] shadow-xl' : ''}`}
            >
              {isDark && <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 blur-3xl rounded-full pointer-events-none" />}
              
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.iconBg}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {!isDark && (
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${stat.positive ? 'bg-brand-500/10 text-brand-600' : 'bg-amber-500/10 text-amber-600'}`}>
                    {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    Tỷ lệ
                  </span>
                )}
              </div>
              
              <div>
                <h3 className={`text-3xl font-extrabold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {stat.value}
                </h3>
                <p className={`text-sm font-medium ${isDark ? 'text-brand-50' : 'text-slate-500 dark:text-slate-400'}`}>
                  {stat.label}
                </p>
              </div>

              <div className={`mt-4 text-xs font-medium ${stat.trendClass || (isDark ? 'text-brand-100' : 'text-slate-400 dark:text-slate-500')}`}>
                {stat.trend}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Bar chart */}
        <div className="xl:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-6 ring-1 ring-slate-200 dark:ring-white/10 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {activeChart === 'revenue' ? 'Doanh thu VNĐ' : 
                 activeChart === 'completed' ? 'Ca hoàn thành' : 
                 activeChart === 'pending' ? 'Tổng lịch hẹn' : 'Bệnh nhân mới'}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Biểu đồ năm {new Date().getFullYear()}</p>
            </div>
            <div className="flex gap-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-brand-500 rounded-full" /> {activeChart === 'revenue' ? 'Doanh thu' : 'Số lượng'}</span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-56 mt-4">
            {chartData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end relative">
                <div
                  className="w-full max-w-[2.5rem] bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-brand-500/20 dark:group-hover:bg-brand-500/30 transition-all duration-300 relative overflow-hidden"
                  style={{ height: `${Math.max((val / maxChart) * 100, 4)}%` }}
                >
                  <div className="absolute bottom-0 left-0 w-full h-full bg-brand-500 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                </div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 whitespace-nowrap z-10 pointer-events-none">
                  {activeChart === 'revenue' ? (val > 0 ? `${(val/1000000).toFixed(1)}M` : '0') : val}
                </div>
                <span className={`text-xs font-bold tracking-wider ${i === new Date().getMonth() ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}>{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent appointments */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm flex flex-col overflow-hidden relative">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-10">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Lịch mới nhất</h3>
            <Link to="/admin/appointments" className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition">
              Tất cả &rarr;
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {recentAppointments.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm font-medium">Chưa có lịch hẹn</div>
            )}
            {recentAppointments.map((apt, idx) => {
              const s = statusMap[apt.status] || statusMap.pending;
              return (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  key={apt._id} 
                  className="px-4 py-3 m-1 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <PawPrint className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {apt.petId?.name || 'Thú cưng'} <span className="text-slate-400 font-medium ml-1">/ {apt.userId?.fullName}</span>
                        </p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{apt.date} · {apt.timeSlot}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.className}`}>{s.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick actions - Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { to: '/admin/appointments', icon: Calendar, label: 'Duyệt lịch hẹn', desc: 'Quản lý lịch đặt', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { to: '/admin/revenue', icon: DollarSign, label: 'Doanh thu', desc: 'Báo cáo tài chính', color: 'text-brand-500', bg: 'bg-brand-500/10' },
          { to: '/admin/pets', icon: PawPrint, label: 'Hồ sơ', desc: 'Quản lý thú cưng', color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { to: '/admin/services', icon: Activity, label: 'Dịch vụ', desc: 'Cấu hình giá', color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((qa, idx) => {
          const QAIcon = qa.icon;
          return (
            <Link
              key={qa.to}
              to={qa.to}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 ring-1 ring-slate-200 dark:ring-white/10 hover:ring-brand-500/50 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-300 group flex flex-col justify-between aspect-video"
            >
              <div className={`w-10 h-10 rounded-2xl ${qa.bg} flex items-center justify-center shrink-0 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <QAIcon className={`w-5 h-5 ${qa.color}`} />
              </div>
              <div>
                <span className="block text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">{qa.label}</span>
                <span className="block text-xs font-medium text-slate-500 mt-1">{qa.desc}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
