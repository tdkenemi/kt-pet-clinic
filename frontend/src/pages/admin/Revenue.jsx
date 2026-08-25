import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, DollarSign, CreditCard, Banknote, QrCode,
  Calendar, ArrowUpRight, Filter, Download, CheckCircle, Clock
} from 'lucide-react';

const token = () => JSON.parse(sessionStorage.getItem('user') || 'null')?.token;

const fmtVND = (n) => (n || 0).toLocaleString('vi-VN') + ' ₫';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

const METHOD_CONFIG = {
  Cash: { label: 'Tiền mặt', icon: Banknote, color: 'text-emerald-600 bg-emerald-50' },
  QR: { label: 'QR Code', icon: QrCode, color: 'text-blue-600 bg-blue-50' },
  BankTransfer: { label: 'Chuyển khoản', icon: CreditCard, color: 'text-violet-600 bg-violet-50' },
  Visa: { label: 'Thẻ Visa', icon: CreditCard, color: 'text-orange-600 bg-orange-50' },
};

export default function Revenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');

  useEffect(() => { fetchRevenue(); }, []);

  const fetchRevenue = async () => {
    try {
      const res = await axios.get('/api/appointments/revenue', {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-slate-100 rounded-xl animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  const maxBar = Math.max(...(data?.byMonth || [1]));
  const now = new Date().getMonth();

  const filteredTransactions = (data?.transactions || []).filter(t => {
    const methodOk = filterMethod === 'all' || t.paymentMethod === filterMethod;
    const monthOk = filterMonth === 'all' || (t.paidAt && new Date(t.paidAt).getMonth() === Number(filterMonth));
    return methodOk && monthOk;
  });

  const statCards = [
    { label: 'Tổng doanh thu', value: fmtVND(data?.totalRevenue), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50', trend: null },
    { label: 'Tháng này', value: fmtVND(data?.thisMonthRevenue), icon: TrendingUp, color: 'text-blue-600 bg-blue-50', trend: null },
    { label: 'Tiền mặt', value: fmtVND(data?.byMethod?.Cash), icon: Banknote, color: 'text-amber-600 bg-amber-50', trend: null },
    { label: 'QR / Chuyển khoản', value: fmtVND((data?.byMethod?.QR || 0) + (data?.byMethod?.BankTransfer || 0) + (data?.byMethod?.Visa || 0)), icon: QrCode, color: 'text-violet-600 bg-violet-50', trend: null },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header Bento */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý Doanh thu</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Thống kê & theo dõi giao dịch thanh toán</p>
        </div>
        <button
          onClick={fetchRevenue}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95"
        >
          <ArrowUpRight className="w-5 h-5" /> Làm mới dữ liệu
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, idx) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm flex flex-col justify-center"
            >
              <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-2">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Bar Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Doanh thu theo tháng</h3>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">Năm {new Date().getFullYear()} • Chỉ tính giao dịch đã thanh toán</p>
          </div>
          <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 ring-1 ring-teal-200 dark:ring-teal-500/30 px-3 py-1.5 rounded-xl uppercase tracking-wider">
            Tổng: {fmtVND(data?.byMonth?.reduce((a, b) => a + b, 0))}
          </span>
        </div>
        <div className="flex items-end gap-2 h-48">
          {(data?.byMonth || Array(12).fill(0)).map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full flex flex-col items-center justify-end" style={{ height: '160px' }}>
                {val > 0 && (
                  <div className="absolute -top-6 text-[10px] font-bold text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {(val / 1000000).toFixed(1)}M
                  </div>
                )}
                <div
                  className={`w-full rounded-t-xl transition-all duration-500 ${i === now ? 'bg-teal-500 dark:bg-teal-600 shadow-[0_0_15px_rgba(20,184,166,0.5)]' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-teal-300 dark:group-hover:bg-teal-800'}`}
                  style={{ height: maxBar > 0 ? `${Math.max((val / maxBar) * 100, 2)}%` : '2%' }}
                />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${i === now ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`}>{MONTHS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phương thức thanh toán */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(METHOD_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={key} className="bg-white dark:bg-slate-900 p-5 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{fmtVND(data?.byMethod?.[key])}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bảng giao dịch */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h3 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Lịch sử giao dịch</h3>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Filter className="w-4 h-4" /> Lọc:
            </div>
            <select
              value={filterMethod}
              onChange={e => setFilterMethod(e.target.value)}
              className="bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-teal-500 transition cursor-pointer flex-1 sm:flex-none"
            >
              <option value="all">Tất cả PT</option>
              {Object.entries(METHOD_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-teal-500 transition cursor-pointer flex-1 sm:flex-none"
            >
              <option value="all">Tất cả tháng</option>
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-20 text-center text-slate-400 dark:text-slate-500">
            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-bold text-sm uppercase tracking-wider">Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Khách hàng</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Dịch vụ</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Số tiền</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Phương thức</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Ngày TT</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredTransactions.map(tx => {
                  const amount = tx.totalPrice || tx.billingDetails?.price || 0;
                  const mc = METHOD_CONFIG[tx.paymentMethod] || { label: 'Chưa rõ', icon: Banknote, color: 'text-slate-500 bg-slate-50 dark:bg-slate-800' };
                  const MethodIcon = mc.icon;
                  return (
                    <tr key={tx._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="py-4 px-6 align-middle">
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{tx.userId?.fullName || 'Khách'}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{tx.petId?.name}</p>
                      </td>
                      <td className="py-4 px-6 align-middle text-sm font-medium text-slate-700 dark:text-slate-300">{tx.services?.map(s => s.name).join(', ') || tx.service}</td>
                      <td className="py-4 px-6 align-middle font-black text-teal-600 dark:text-teal-400 tracking-tight">{fmtVND(amount)}</td>
                      <td className="py-4 px-6 align-middle">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl ${mc.color}`}>
                          <MethodIcon className="w-3.5 h-3.5" />{mc.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 align-middle text-sm font-medium text-slate-600 dark:text-slate-400">{fmtDate(tx.paidAt)}</td>
                      <td className="py-4 px-6 align-middle">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-xl">
                          <CheckCircle className="w-3.5 h-3.5" /> Đã thanh toán
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
