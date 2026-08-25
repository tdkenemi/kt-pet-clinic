import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAlert } from '../../contexts/AlertContext';
import { CheckCircle, Clock, XCircle, Search, RefreshCw, FileText } from 'lucide-react';
import dayjs from 'dayjs';

export default function PaymentHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { formatCurrency } = useLanguage();
  const { showAlert } = useAlert();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.get('/api/payments/transactions', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTransactions(res.data);
    } catch (error) {
      console.error(error);
      showAlert('Lỗi', 'Không thể tải lịch sử giao dịch', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTxs = transactions.filter(tx => 
    tx.transferDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.providerTransactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.appointmentId?.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Lịch Sử Giao Dịch VietQR</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Quản lý và đối soát các khoản thanh toán qua mã QR</p>
        </div>
        <button onClick={fetchTransactions} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95">
          <RefreshCw className="w-5 h-5" /> Làm mới
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-white/10 overflow-hidden">
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
            Tổng cộng: <span className="text-blue-600 dark:text-blue-400">{filteredTxs.length}</span> giao dịch
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium">Đang tải dữ liệu...</div>
        ) : filteredTxs.length === 0 ? (
          <div className="p-20 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-bold text-sm uppercase tracking-wider">Chưa có giao dịch nào.</p>
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
                {filteredTxs.map(tx => (
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
                      <span className="font-black text-blue-600 dark:text-blue-400 tracking-tight">{formatCurrency(tx.amount)}</span>
                      {tx.appointmentId && tx.amount !== (tx.appointmentId.totalPrice || tx.appointmentId.estimatedPrice) && (
                         <div className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 mt-1 bg-red-50 dark:bg-red-500/10 inline-block px-2 py-0.5 rounded border border-red-200 dark:border-red-500/30" title="Lệch số tiền với hóa đơn">Lệch hóa đơn</div>
                      )}
                    </td>
                    <td className="py-4 px-6 align-middle text-sm font-medium text-slate-600 dark:text-slate-400">
                      {tx.paidAt ? dayjs(tx.paidAt).format('DD/MM/YYYY HH:mm') : '-'}
                    </td>
                    <td className="py-4 px-6 align-middle">
                      {tx.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-500/30">
                          <CheckCircle className="w-3.5 h-3.5" /> Thành công
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-500/30">
                          <Clock className="w-3.5 h-3.5" /> Chờ xử lý
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
