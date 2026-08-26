import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, DollarSign, CreditCard, Banknote, QrCode,
  Calendar, ArrowUpRight, Filter, CheckCircle, Clock, Search, FileText
} from 'lucide-react';
import dayjs from 'dayjs';

const token = () => JSON.parse(sessionStorage.getItem('user') || 'null')?.token;

const fmtVND = (n) => (n || 0).toLocaleString('vi-VN') + ' ₫';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

const METHOD_CONFIG = {
  Cash: { label: 'Tiền mặt', icon: Banknote, color: 'text-brand-600 bg-brand-50' },
  QR: { label: 'QR Code', icon: QrCode, color: 'text-blue-600 bg-blue-50' },
  BankTransfer: { label: 'Chuyển khoản', icon: CreditCard, color: 'text-violet-600 bg-violet-50' },
  Visa: { label: 'Thẻ Visa', icon: CreditCard, color: 'text-orange-600 bg-orange-50' },
  VNPay: { label: 'VNPay', icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
};

export default function Revenue() {
  const [data, setData] = useState(null);
  const [gatewayTxs, setGatewayTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'gateway'
  
  // Filters for Invoices
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  
  // Search for Gateway
  const [searchTerm, setSearchTerm] = useState('');

  // Sort Order
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [revRes, txRes] = await Promise.all([
        axios.get('/api/appointments/revenue', { headers: { Authorization: `Bearer ${token()}` } }),
        axios.get('/api/payments/transactions', { headers: { Authorization: `Bearer ${token()}` } })
      ]);
      setData(revRes.data);
      setGatewayTxs(txRes.data);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
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

  // INVOICES FILTER
  let filteredInvoices = (data?.transactions || []).filter(t => {
    const methodOk = filterMethod === 'all' || t.paymentMethod === filterMethod;
    const monthOk = filterMonth === 'all' || (t.paidAt && new Date(t.paidAt).getMonth() === Number(filterMonth));
    return methodOk && monthOk;
  });
  
  filteredInvoices.sort((a, b) => {
    const dateA = new Date(a.paidAt || a.createdAt);
    const dateB = new Date(b.paidAt || b.createdAt);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // GATEWAY FILTER
  let filteredGatewayTxs = gatewayTxs.filter(tx => 
    tx.transferDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.providerTransactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.appointmentId?.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  filteredGatewayTxs.sort((a, b) => {
    const dateA = new Date(a.transactionDate || a.createdAt);
    const dateB = new Date(b.transactionDate || b.createdAt);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const statCards = [
    { label: 'Tổng doanh thu', value: fmtVND(data?.totalRevenue), icon: DollarSign, color: 'text-brand-600 bg-brand-50', trend: null },
    { label: 'Tháng này', value: fmtVND(data?.thisMonthRevenue), icon: TrendingUp, color: 'text-blue-600 bg-blue-50', trend: null },
    { label: 'Tiền mặt', value: fmtVND(data?.byMethod?.Cash), icon: Banknote, color: 'text-amber-600 bg-amber-50', trend: null },
    { label: 'QR / Chuyển khoản', value: fmtVND((data?.byMethod?.QR || 0) + (data?.byMethod?.BankTransfer || 0) + (data?.byMethod?.Visa || 0) + (data?.byMethod?.VNPay || 0)), icon: QrCode, color: 'text-violet-600 bg-violet-50', trend: null },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header Bento */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Tài chính & Doanh thu</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Thống kê doanh thu & đối soát giao dịch</p>
        </div>
        <button
          onClick={fetchAllData}
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
          <span className="text-xs font-bold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 ring-1 ring-brand-200 dark:ring-brand-500/30 px-3 py-1.5 rounded-xl uppercase tracking-wider">
            Tổng: {fmtVND(data?.byMonth?.reduce((a, b) => a + b, 0))}
          </span>
        </div>
        <div className="flex items-end gap-2 h-48">
          {(data?.byMonth || Array(12).fill(0)).map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full flex flex-col items-center justify-end" style={{ height: '160px' }}>
                {val > 0 && (
                  <div className="absolute -top-6 text-[10px] font-bold text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {(val / 1000000).toFixed(1)}M
                  </div>
                )}
                <div
                  className={`w-full rounded-t-xl transition-all duration-500 ${i === now ? 'bg-brand-500 dark:bg-brand-600 shadow-[0_0_15px_rgba(20,184,166,0.5)]' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-300 dark:group-hover:bg-brand-800'}`}
                  style={{ height: maxBar > 0 ? `${Math.max((val / maxBar) * 100, 2)}%` : '2%' }}
                />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${i === now ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}>{MONTHS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs & Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm overflow-hidden flex flex-col">
        {/* Tabs Header */}
        <div className="flex border-b border-slate-200 dark:border-white/10">
          <button 
            onClick={() => setActiveTab('invoices')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'invoices' ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-500 bg-brand-50/50 dark:bg-brand-900/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            Lịch sử Hoá đơn
          </button>
          <button 
            onClick={() => setActiveTab('gateway')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'gateway' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            Giao dịch Đối soát (VNPay/VietQR)
          </button>
        </div>

        {/* Tab Content: INVOICES */}
        {activeTab === 'invoices' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tổng cộng: <span className="text-brand-600 dark:text-brand-400">{filteredInvoices.length}</span> hoá đơn
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Filter className="w-4 h-4" /> Lọc:
                </div>
                <select
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value)}
                  className="bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-brand-500 cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                </select>
                <select
                  value={filterMethod}
                  onChange={e => setFilterMethod(e.target.value)}
                  className="bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-brand-500 cursor-pointer"
                >
                  <option value="all">Tất cả PT</option>
                  {Object.entries(METHOD_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <select
                  value={filterMonth}
                  onChange={e => setFilterMonth(e.target.value)}
                  className="bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-brand-500 cursor-pointer"
                >
                  <option value="all">Tất cả tháng</option>
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
            </div>
            
            {filteredInvoices.length === 0 ? (
              <div className="py-20 text-center text-slate-400 dark:text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-bold text-sm uppercase tracking-wider">Chưa có hoá đơn nào</p>
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
                    {filteredInvoices.map(tx => {
                      const amount = tx.totalPrice || tx.billingDetails?.price || 0;
                      const mc = METHOD_CONFIG[tx.paymentMethod] || { label: 'Chưa rõ', icon: Banknote, color: 'text-slate-500 bg-slate-50 dark:bg-slate-800' };
                      const MethodIcon = mc.icon;
                      return (
                        <tr key={tx._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="py-4 px-6 align-middle">
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{tx.userId?.fullName || 'Khách'}</p>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{tx.petId?.name}</p>
                          </td>
                          <td className="py-4 px-6 align-middle text-sm font-medium text-slate-700 dark:text-slate-300">{tx.services?.map(s => s.name).join(', ') || tx.service}</td>
                          <td className="py-4 px-6 align-middle font-black text-brand-600 dark:text-brand-400 tracking-tight">{fmtVND(amount)}</td>
                          <td className="py-4 px-6 align-middle">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl ${mc.color}`}>
                              <MethodIcon className="w-3.5 h-3.5" />{mc.label}
                            </span>
                          </td>
                          <td className="py-4 px-6 align-middle text-sm font-medium text-slate-600 dark:text-slate-400">{fmtDate(tx.paidAt)}</td>
                          <td className="py-4 px-6 align-middle">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1.5 rounded-xl">
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
          </motion.div>
        )}

        {/* Tab Content: GATEWAY */}
        {activeTab === 'gateway' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 ring-1 ring-slate-200 dark:ring-white/10 w-full md:w-80 focus-within:ring-blue-500 transition-all">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm mã GD, Nội dung, Tên KH..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl ring-1 ring-slate-200 dark:ring-white/10">
                Tổng cộng: <span className="text-blue-600 dark:text-blue-400">{filteredGatewayTxs.length}</span> giao dịch
              </div>
            </div>

            {filteredGatewayTxs.length === 0 ? (
              <div className="p-20 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center">
                <FileText className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-bold text-sm uppercase tracking-wider">Chưa có giao dịch đối soát nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Mã Giao Dịch (Provider)</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Khách Hàng / Lịch Hẹn</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Nội dung CK</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Số tiền</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Thời gian</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredGatewayTxs.map(tx => {
                      const invoiceAmount = tx.appointmentId?.totalPrice || tx.appointmentId?.estimatedPrice || 0;
                      const isMismatch = tx.appointmentId && tx.amount !== invoiceAmount;
                      
                      return (
                        <tr key={tx._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="py-4 px-6 align-middle">
                            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10">
                              {tx.providerTransactionId || tx._id}
                            </span>
                          </td>
                          <td className="py-4 px-6 align-middle">
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tx.appointmentId?.userId?.fullName || 'Không rõ'}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">{tx.appointmentId?.petId?.name} - {tx.appointmentId?.services?.map(s => s.name).join(', ') || tx.appointmentId?.service}</p>
                          </td>
                          <td className="py-4 px-6 align-middle">
                            <p className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-500/30 px-2.5 py-1.5 rounded-lg inline-block">
                              {tx.transferDescription}
                            </p>
                          </td>
                          <td className="py-4 px-6 align-middle">
                            <span className="font-black text-blue-600 dark:text-blue-400 tracking-tight">{fmtVND(tx.amount)}</span>
                            {isMismatch && (
                              <div className="block mt-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded border border-red-200 dark:border-red-500/30" title="Lệch số tiền với hóa đơn">
                                  Lệch hóa đơn
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6 align-middle text-sm font-medium text-slate-600 dark:text-slate-400">
                            {tx.paidAt ? dayjs(tx.paidAt).format('DD/MM/YYYY HH:mm') : '-'}
                          </td>
                          <td className="py-4 px-6 align-middle">
                            {tx.status === 'PAID' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 ring-1 ring-brand-200 dark:ring-brand-500/30">
                                <CheckCircle className="w-3.5 h-3.5" /> Thành công
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-500/30">
                                <Clock className="w-3.5 h-3.5" /> Chờ xử lý
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
