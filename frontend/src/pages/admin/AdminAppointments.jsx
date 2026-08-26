import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, X, CheckCircle, Clock, Search, Filter, XCircle, QrCode, Banknote } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlert } from '../../contexts/AlertContext';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [staffs, setStaffs] = useState([]);
  const [users, setUsers] = useState([]);
  const [allPets, setAllPets] = useState([]);
  const [allServices, setAllServices] = useState([]);

  // Modal Create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createData, setCreateData] = useState({
    userId: '', petId: '', vetId: '', services: [], date: '', timeSlot: '',
    reason: '', serviceLocation: 'clinic', homeAddress: '', adminPaymentOverride: 'Pending'
  });
  const [creating, setCreating] = useState(false);

  const [status, setStatus] = useState('pending');
  const [clinicNote, setClinicNote] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [vetName, setVetName] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [vetId, setVetId] = useState('');
  const [clinicAddress, setClinicAddress] = useState('123 Đường Y Tế, Phường Thú Cưng, Quận 1');
  const [price, setPrice] = useState(0);
  const [travelFee, setTravelFee] = useState(0);
  const [saving, setSaving] = useState(false);

  const { formatCurrency } = useLanguage();
  const { showAlert, showConfirm } = useAlert();

  const fetchData = async () => {
    try {
      const token = JSON.parse(sessionStorage.getItem('user'))?.token;
      const headers = { Authorization: `Bearer ${token}` };
      const [aptRes, staffRes, usersRes, petsRes, servicesRes] = await Promise.all([
        axios.get('/api/appointments', { headers }),
        axios.get('/api/staffs', { headers }),
        axios.get('/api/users', { headers }),
        axios.get('/api/pets', { headers }),
        axios.get('/api/services', { headers })
      ]);
      setAppointments(aptRes.data);
      setFiltered(aptRes.data);
      setStaffs(staffRes.data);
      setUsers(usersRes.data);
      setAllPets(petsRes.data);
      setAllServices(servicesRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let result = appointments;
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter);
    if (speciesFilter !== 'all') result = result.filter(a => (a.petId?.species || 'Khác') === speciesFilter);
    if (serviceFilter !== 'all') result = result.filter(a => a.services?.some(s => s.name === serviceFilter) || a.service === serviceFilter);
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        (a.userId?.fullName || '').toLowerCase().includes(q) ||
        (a.petId?.name || '').toLowerCase().includes(q) ||
        ((a.services || []).map(s => s.name).join(', ') || a.service || '').toLowerCase().includes(q) ||
        (a._id || '').toLowerCase().includes(q)
      );
    }
    
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date);
      const dateB = new Date(b.createdAt || b.date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFiltered(result);
  }, [search, statusFilter, speciesFilter, serviceFilter, sortOrder, appointments]);

  const openApprovalModal = (apt) => {
    setSelectedApt(apt);
    setStatus(apt.status);
    setClinicNote(apt.clinicNote || (apt.serviceLocation === 'home' ? 'Bác sĩ sẽ liên hệ trước khi đến.' : 'Vui lòng đến đúng giờ. Không cho thú cưng ăn trước khi khám 2 tiếng.'));
    setCancellationReason(apt.cancellationReason || '');
    setVetName(apt.billingDetails?.vetName || '');
    setVetPhone(apt.billingDetails?.vetPhone || '');
    setVetId(apt.vetId?._id || apt.vetId || '');
    setClinicAddress(apt.billingDetails?.clinicAddress || '123 Đường Y Tế, Phường Thú Cưng, Quận 1');
    setPrice(apt.billingDetails?.price || apt.estimatedPrice || 0);
    setTravelFee(apt.travelFee || 0);
    setIsModalOpen(true);
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    if (status === 'cancelled' && !cancellationReason.trim()) {
      return showAlert('Cảnh báo', 'Vui lòng nhập lý do hủy lịch', 'warning');
    }
    setSaving(true);
    const token = JSON.parse(sessionStorage.getItem('user'))?.token;
    try {
      await axios.put(`/api/appointments/${selectedApt._id}/status`, {
        status, clinicNote, cancellationReason, travelFee: Number(travelFee),
        billingDetails: { vetName, vetPhone, clinicAddress, price: Number(price) },
        vetId: vetId || undefined
      }, { headers: { Authorization: `Bearer ${token}` } });
      setIsModalOpen(false);
      fetchData();
      showAlert('Thành công', 'Cập nhật lịch hẹn thành công', 'success');
    } catch { 
      showAlert('Lỗi', 'Lỗi cập nhật lịch hẹn', 'error'); 
    }
    finally { setSaving(false); }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!createData.userId || !createData.petId || createData.services.length === 0 || !createData.date || !createData.timeSlot) {
      return showAlert('Lỗi', 'Vui lòng điền đầy đủ các thông tin bắt buộc', 'error');
    }
    setCreating(true);
    const token = JSON.parse(sessionStorage.getItem('user'))?.token;
    
    // Tính tổng giá trị dự kiến từ các dịch vụ đã chọn
    const calculatedPrice = createData.services.reduce((sum, s) => sum + (s.price || 0), 0);
    const payload = { ...createData, estimatedPrice: calculatedPrice };

    try {
      await axios.post('/api/appointments', payload, { headers: { Authorization: `Bearer ${token}` } });
      setIsCreateModalOpen(false);
      fetchData();
      showAlert('Thành công', 'Đã tạo lịch hẹn mới', 'success');
      setCreateData({ userId: '', petId: '', vetId: '', services: [], date: '', timeSlot: '', reason: '', serviceLocation: 'clinic', homeAddress: '', adminPaymentOverride: 'Pending' });
    } catch (error) {
      showAlert('Lỗi', error.response?.data?.message || 'Lỗi tạo lịch hẹn', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleConfirmCash = (id) => {
    showConfirm('Xác nhận thanh toán', 'Xác nhận khách đã thanh toán tiền mặt?', async () => {
      const token = JSON.parse(sessionStorage.getItem('user'))?.token;
      try {
        await axios.patch(`/api/payments/${id}/pay`, 
          { paymentMethod: 'Cash' }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchData();
        showAlert('Thành công', 'Đã xác nhận thanh toán tiền mặt', 'success');
      } catch { 
        showAlert('Lỗi', 'Lỗi cập nhật thanh toán', 'error'); 
      }
    });
  };

  // Admin xác nhận đã nhận tiền QR/chuyển khoản (kiểm tra biến động ngân hàng thủ công)
  const handleConfirmQRPayment = (id) => {
    showConfirm(
      '✅ Xác nhận đã nhận QR',
      'Bạn đã kiểm tra biến động tài khoản ngân hàng và xác nhận đã nhận được tiền thanh toán QR?',
      async () => {
        const token = JSON.parse(sessionStorage.getItem('user'))?.token;
        try {
          await axios.patch(`/api/payments/${id}/pay`,
            { paymentMethod: 'QR' },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          fetchData();
          showAlert('Thành công', '✅ Đã xác nhận thanh toán QR thành công!', 'success');
        } catch {
          showAlert('Lỗi', 'Lỗi xác nhận thanh toán QR', 'error');
        }
      }
    );
  };

  const handleProcessRefund = (id) => {
    showConfirm(
      'Xác nhận hoàn tiền',
      'Xác nhận bạn đã chuyển khoản hoàn lại tiền cho khách hàng?',
      async () => {
        const token = JSON.parse(sessionStorage.getItem('user'))?.token;
        try {
          await axios.patch(`/api/payments/${id}/refund`, {}, { headers: { Authorization: `Bearer ${token}` } });
          fetchData();
          showAlert('Thành công', 'Đã ghi nhận hoàn tiền thành công', 'success');
        } catch {
          showAlert('Lỗi', 'Lỗi xử lý hoàn tiền', 'error');
        }
      }
    );
  };

  const handleDelete = (id) => {
    showConfirm('Xác nhận xóa', 'Xóa lịch hẹn này?', async () => {
      const token = JSON.parse(sessionStorage.getItem('user'))?.token;
      try {
        await axios.delete(`/api/appointments/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
        showAlert('Thành công', 'Đã xóa lịch hẹn', 'success');
      } catch { 
        showAlert('Lỗi', 'Lỗi xóa', 'error'); 
      }
    });
  };

  const statusBadge = (s) => {
    const map = {
      completed: <span className="badge-completed"><CheckCircle className="w-3 h-3" /> Hoàn thành</span>,
      pending: <span className="badge-pending"><Clock className="w-3 h-3" /> Chờ duyệt</span>,
      confirmed: <span className="badge-confirmed"><CheckCircle className="w-3 h-3" /> Đã xác nhận</span>,
      cancelled: <span className="badge-cancelled"><XCircle className="w-3 h-3" /> Đã hủy</span>,
    };
    return map[s] || map.pending;
  };

  const paymentBadge = (apt) => {
    if (!['confirmed', 'completed', 'cancelled'].includes(apt.status)) return null;
    
    if (apt.paymentStatus === 'RefundPending') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
          ⚠️ Cần hoàn tiền
        </span>
      );
    }
    if (apt.paymentStatus === 'Refunded') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
          ↩️ Đã hoàn tiền
        </span>
      );
    }

    if (apt.paymentStatus === 'Paid') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
          <CheckCircle className="w-3 h-3" /> Đã TT {apt.paymentMethod && `(${apt.paymentMethod})`}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
        <Clock className="w-3 h-3" /> Chưa TT {apt.paymentMethod && apt.paymentMethod !== 'Unpaid' ? `(${apt.paymentMethod})` : ''}
      </span>
    );
  };

  const counts = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  const uniqueServices = Array.from(new Set(appointments.flatMap(a => a.services ? a.services.map(s => s.name) : [a.service]))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header & Stats Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Header (Span 2) */}
        <div className="lg:col-span-5 xl:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm flex flex-col justify-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Duyệt Lịch Hẹn & Xuất Bill</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Quản lý đặt lịch, gửi thông tin phòng khám và dặn dò</p>
          
          {/* Search & Actions */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 flex items-center gap-3 bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 py-3 ring-1 ring-slate-200 dark:ring-white/5 focus-within:ring-brand-500 transition-all w-full">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tìm khách hàng, mã, dịch vụ..."
                className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
              />
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 transition-all shrink-0 active:scale-95"
            >
              + Tạo lịch hẹn
            </button>
          </div>
        </div>

        {/* Stats (Span 3 split) */}
        <div className="lg:col-span-5 xl:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Tổng', count: counts.all, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-800' },
            { label: 'Chờ duyệt', count: counts.pending, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            { label: 'Đã xác nhận', count: counts.confirmed, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { label: 'Hoàn thành', count: counts.completed, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-500/10' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-3xl p-5 ring-1 ring-slate-200/50 dark:ring-white/5 shadow-sm flex flex-col justify-center`}>
              <p className={`text-3xl font-black ${s.color}`}>{s.count}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${s.color} opacity-80`}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase tracking-wider shrink-0 pl-2">
          <Filter className="w-4 h-4" /> Lọc theo:
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select
            value={speciesFilter} onChange={e => setSpeciesFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-brand-500 transition cursor-pointer flex-1 sm:flex-none"
          >
            <option value="all">Tất cả Loài</option>
            <option value="Chó">Chó</option>
            <option value="Mèo">Mèo</option>
            <option value="Khác">Khác</option>
          </select>
          <select
            value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-brand-500 transition cursor-pointer flex-1 sm:flex-none"
          >
            <option value="all">Tất cả Dịch vụ</option>
            {uniqueServices.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-brand-500 transition cursor-pointer flex-1 sm:flex-none"
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={sortOrder} onChange={e => setSortOrder(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-brand-500 transition cursor-pointer flex-1 sm:flex-none"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden ring-1 ring-slate-200 dark:ring-white/10 shadow-sm">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/50">
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Khách hàng</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Thú cưng & Dịch vụ</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Thời gian</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Tổng tiền</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Trạng thái</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map(apt => (
                  <tr key={apt._id} onClick={() => openApprovalModal(apt)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-4 px-6 align-top">
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{apt.userId?.fullName || 'Khách vãng lai'}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{apt.userId?.phone}</p>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {apt.petId?.name} <span className="font-medium text-slate-500 dark:text-slate-400 ml-1">({apt.petId?.species})</span>
                      </p>
                      <div className="mt-2 space-y-1">
                        {(apt.services || []).map((s, i) => (
                          <p key={i} className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <span className="text-brand-600 dark:text-brand-400 font-bold">{s.name}</span> — {formatCurrency(s.price)}
                          </p>
                        )) || (
                          <p className="text-xs font-bold text-brand-600 dark:text-brand-400">{apt.services?.map(s => s.name).join(', ') || apt.service}</p>
                        )}
                      </div>
                      
                      {/* Location Badge */}
                      <div className="mt-2.5">
                        {apt.serviceLocation === 'home' ? (
                          <div className="inline-flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg">
                              🏠 Tại nhà
                            </span>
                            {apt.homeAddress && <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[200px]" title={apt.homeAddress}>{apt.homeAddress}</p>}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg">
                            🏥 Tại phòng khám
                          </span>
                        )}
                      </div>

                      {/* Assigned Vet */}
                      {apt.billingDetails?.vetName && (
                        <p className="text-[11px] text-brand-600 dark:text-brand-400 font-bold mt-2 flex items-center gap-1">
                          👨‍⚕️ BS: {apt.billingDetails.vetName}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6 align-top">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{apt.date}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{apt.timeSlot}</p>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-[13px] font-black bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 ring-1 ring-brand-200 dark:ring-brand-500/30 whitespace-nowrap shadow-sm">
                        {formatCurrency(apt.totalPrice || apt.billingDetails?.price || apt.estimatedPrice || 0)}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <div className="mb-2">{statusBadge(apt.status)}</div>
                      {paymentBadge(apt)}
                    </td>
                    <td className="py-4 px-6 align-top text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {/* Xác nhận tiền mặt & QR */}
                        {['confirmed','completed'].includes(apt.status) && apt.paymentStatus !== 'Paid' && (
                          <div className="flex gap-1">
                            <button
                              onClick={e => { e.stopPropagation(); handleConfirmQRPayment(apt._id); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 rounded-xl transition-all"
                              title="Xác nhận đã nhận tiền QR/Chuyển khoản"
                            >
                              <QrCode className="w-3.5 h-3.5" /> QR
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); handleConfirmCash(apt._id); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 rounded-xl transition-all"
                              title="Xác nhận đã thu tiền mặt"
                            >
                              <Banknote className="w-3.5 h-3.5" /> TM
                            </button>
                          </div>
                        )}
                        {/* Xử lý hoàn tiền */}
                        {apt.paymentStatus === 'RefundPending' && (
                          <button
                            onClick={e => { e.stopPropagation(); handleProcessRefund(apt._id); }}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 rounded-xl transition-all"
                            title="Xác nhận đã chuyển khoản trả lại tiền"
                          >
                            Hoàn tiền
                          </button>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); openApprovalModal(apt); }}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 rounded-xl transition-all active:scale-95"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(apt._id); }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="6" className="py-16 text-center text-slate-500 dark:text-slate-400 font-medium text-sm">Không có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approval Modal */}
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
              className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-2xl flex flex-col max-h-[95vh] ring-1 ring-slate-200 dark:ring-white/10 overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50">
                <div>
                  <h3 className="font-black text-xl tracking-tight text-slate-900 dark:text-white">Phiếu Hẹn & Ghi chú (Bill)</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">Thông tin này sẽ hiển thị cho khách hàng xem</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApprove} className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-6">
                  {/* Summary */}
                  <div className="bg-brand-50 dark:bg-brand-500/10 ring-1 ring-brand-200 dark:ring-brand-500/30 p-5 rounded-3xl flex justify-between items-start">
                    <div>
                      <p className="font-black text-lg text-brand-900 dark:text-brand-400">
                        {selectedApt.userId?.fullName} — {selectedApt.petId?.name}
                      </p>
                      <p className="text-sm font-medium text-brand-700 dark:text-brand-300 mt-1">Dịch vụ: {(selectedApt.services || []).map(s => s.name).join(', ') || selectedApt.service} · {selectedApt.reason}</p>
                      <p className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-500 mt-2 bg-white/50 dark:bg-black/20 inline-block px-2 py-1 rounded-lg">
                        ID: {selectedApt._id}
                      </p>
                      {selectedApt.serviceLocation === 'home' && (
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-2 bg-amber-100/50 dark:bg-amber-500/10 inline-block px-3 py-1 rounded-lg">
                          🏠 Tại nhà: {selectedApt.homeAddress}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0 bg-white/50 dark:bg-black/20 p-3 rounded-2xl">
                      <p className="text-sm font-black text-brand-900 dark:text-brand-400">{selectedApt.date}</p>
                      <p className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider">{selectedApt.timeSlot}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Trạng thái</label>
                      <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all">
                        <option value="pending">⏳ Chờ duyệt</option>
                        <option value="confirmed">✅ Xác nhận lịch</option>
                        <option value="completed">🏁 Đã hoàn thành</option>
                        <option value="cancelled">❌ Hủy lịch</option>
                      </select>
                    </div>
                    {status === 'cancelled' && (
                      <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-red-500 mb-2">Lý do hủy *</label>
                        <input type="text" required value={cancellationReason} onChange={e => setCancellationReason(e.target.value)} className="w-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl px-4 py-3 text-sm font-medium text-red-900 dark:text-red-400 focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder:text-red-300 dark:placeholder:text-red-500/50" placeholder="VD: Khách báo bận, Bác sĩ có ca cấp cứu..." />
                      </div>
                    )}
                    
                    {status !== 'cancelled' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Giá dịch vụ (VNĐ)</label>
                          <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all" />
                        </div>
                        {selectedApt.serviceLocation === 'home' && (
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Phí di chuyển (VNĐ)</label>
                            <input type="number" min="0" value={travelFee} onChange={e => setTravelFee(e.target.value)} className="w-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Nhân sự phụ trách *</label>
                          <select 
                            required 
                            value={vetId} 
                            onChange={e => {
                              const sid = e.target.value;
                              setVetId(sid);
                              const staff = staffs.find(s => s._id === sid);
                              if (staff) {
                                setVetName(staff.name);
                                setVetPhone(staff.phone || '');
                              } else {
                                setVetName('');
                                setVetPhone('');
                              }
                            }} 
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                          >
                            <option value="">-- Chọn nhân sự --</option>
                            {staffs.filter(s => s.role !== 'Admin').map(s => (
                              <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">SĐT Hotline *</label>
                          <input type="text" required value={vetPhone} onChange={e => setVetPhone(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all" placeholder="Ví dụ: 0901234567" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Địa chỉ phòng khám *</label>
                          <input type="text" required value={clinicAddress} onChange={e => setClinicAddress(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Ghi chú & Dặn dò</label>
                          <textarea rows="3" value={clinicNote} onChange={e => setClinicNote(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none" />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col">
                    {status !== 'cancelled' ? (
                      <>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Tổng hóa đơn</span>
                        <span className="text-2xl font-black text-brand-600 dark:text-brand-400">{formatCurrency(Number(price) + Number(travelFee))}</span>
                        {selectedApt.services && selectedApt.services.length > 1 && (
                          <span className="text-[10px] font-medium text-slate-400 mt-1">
                            Dịch vụ: {formatCurrency(selectedApt.services.reduce((a,b) => a + (b.price||0), 0))}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-red-500 font-bold uppercase tracking-wider">Đang thao tác Hủy lịch</span>
                    )}
                  </div>
                  
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 sm:flex-none py-3 px-6 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95">
                      Hủy
                    </button>
                    <button type="submit" disabled={saving} className="flex-1 sm:flex-none py-3 px-6 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100">
                      {saving ? 'Đang lưu...' : 'Lưu & Gửi Phiếu'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Create Appointment Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-2xl flex flex-col max-h-[95vh] ring-1 ring-slate-200 dark:ring-white/10 overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50">
                <div>
                  <h3 className="font-black text-xl tracking-tight text-slate-900 dark:text-white">Tạo lịch hẹn (Admin)</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">Chủ động tạo lịch cho khách hàng</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAppointment} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Khách hàng *</label>
                    <select
                      required
                      value={createData.userId}
                      onChange={e => setCreateData({ ...createData, userId: e.target.value, petId: '' })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    >
                      <option value="">-- Chọn khách hàng --</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>{u.fullName} ({u.phone})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Thú cưng *</label>
                    <select
                      required
                      value={createData.petId}
                      onChange={e => setCreateData({ ...createData, petId: e.target.value })}
                      disabled={!createData.userId}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all disabled:opacity-50"
                    >
                      <option value="">-- Chọn thú cưng --</option>
                      {allPets.filter(p => p.ownerId?._id === createData.userId || p.ownerId === createData.userId).map(p => (
                        <option key={p._id} value={p._id}>{p.name} ({p.species})</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Nhân sự phụ trách (Tùy chọn)</label>
                    <select
                      value={createData.vetId}
                      onChange={e => setCreateData({ ...createData, vetId: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    >
                      <option value="">-- Chọn nhân sự --</option>
                      {staffs.filter(s => s.role !== 'Admin').map(s => (
                        <option key={s._id} value={s._id}>{s.fullName || s.name} ({s.role})</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Dịch vụ *</label>
                    <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto custom-scrollbar p-2 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                      {allServices
                        .filter(s => createData.serviceLocation === 'clinic' ? s.clinicServiceAvailable : s.homeServiceAvailable)
                        .map(s => {
                        const isSelected = createData.services.some(x => x.name === s.name);
                        return (
                          <label key={s._id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${isSelected ? 'bg-brand-50 border-brand-200 dark:bg-brand-500/10 dark:border-brand-500/30' : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-white/5 hover:border-brand-300'}`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                let newServices = [...createData.services];
                                if (e.target.checked) newServices.push({ name: s.name, price: s.basePrice });
                                else newServices = newServices.filter(x => x.name !== s.name);
                                setCreateData({ ...createData, services: newServices });
                              }}
                              className="w-4 h-4 text-brand-600 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{s.name}</p>
                              <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">{formatCurrency(s.basePrice)}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Ngày hẹn *</label>
                    <input
                      type="date" required
                      min={new Date().toISOString().split('T')[0]}
                      value={createData.date}
                      onChange={e => setCreateData({ ...createData, date: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Giờ hẹn *</label>
                    <select
                      required
                      value={createData.timeSlot}
                      onChange={e => setCreateData({ ...createData, timeSlot: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    >
                      <option value="">-- Chọn giờ --</option>
                      {['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Hình thức khám</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="radio" name="loc" checked={createData.serviceLocation === 'clinic'} onChange={() => {
                          const validServices = createData.services.filter(sel => {
                            const fullService = allServices.find(as => as.name === sel.name);
                            return fullService && fullService.clinicServiceAvailable;
                          });
                          setCreateData({ ...createData, serviceLocation: 'clinic', homeAddress: '', services: validServices });
                        }} className="text-brand-500 focus:ring-brand-500" />
                        Tại phòng khám
                      </label>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="radio" name="loc" checked={createData.serviceLocation === 'home'} onChange={() => {
                          // Lọc lại các dịch vụ đang chọn nếu chuyển sang khám tại nhà
                          const validServices = createData.services.filter(sel => {
                            const fullService = allServices.find(as => as.name === sel.name);
                            return fullService && fullService.homeServiceAvailable;
                          });
                          setCreateData({ ...createData, serviceLocation: 'home', services: validServices });
                        }} className="text-brand-500 focus:ring-brand-500" />
                        Khám tại nhà
                      </label>
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Trạng thái thanh toán (Tùy chọn)</label>
                    <select
                      value={createData.adminPaymentOverride}
                      onChange={e => setCreateData({ ...createData, adminPaymentOverride: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    >
                      <option value="Pending">Chờ khách tự thanh toán (Mặc định)</option>
                      <option value="Cash">Đã thu Tiền mặt (Lịch tự động xác nhận)</option>
                      <option value="QR">Đã nhận Chuyển khoản (Lịch tự động xác nhận)</option>
                    </select>
                  </div>

                  {createData.serviceLocation === 'home' && (
                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Địa chỉ nhà *</label>
                      <input
                        type="text" required
                        value={createData.homeAddress}
                        onChange={e => setCreateData({ ...createData, homeAddress: e.target.value })}
                        className="w-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                        placeholder="Nhập địa chỉ chi tiết để BS tới khám..."
                      />
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Lý do / Triệu chứng *</label>
                    <textarea
                      required rows="2"
                      value={createData.reason}
                      onChange={e => setCreateData({ ...createData, reason: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="py-3 px-6 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95">
                    Hủy
                  </button>
                  <button type="submit" disabled={creating} className="py-3 px-6 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-70">
                    {creating ? 'Đang tạo...' : 'Xác nhận tạo'}
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
