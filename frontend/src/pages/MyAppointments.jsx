import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, Clock, MapPin, Phone, User, FileText,
  CheckCircle, XCircle, Plus, ChevronRight, Bell, MessageSquare, QrCode, RefreshCw, Trash2, Banknote, CreditCard, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAlert } from '../contexts/AlertContext';
import { Link } from 'react-router-dom';

const getUser = () => {
  try { return JSON.parse(sessionStorage.getItem('user') || 'null'); }
  catch { return null; }
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [selectedApt, setSelectedApt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vnpayLoading, setVnpayLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select'); // 'select', 'qr', 'cash'
  const [paymentData, setPaymentData] = useState(null);
  const { showAlert, showConfirm } = useAlert();
  const user = getUser();
  const { t, formatCurrency } = useLanguage();

  useEffect(() => {
    if (!user) { window.location.href = '/login'; return; }
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (selectedApt && (selectedApt.status === 'completed' || selectedApt.status === 'confirmed') && selectedApt.paymentStatus !== 'Paid') {
      axios.get(`/api/payments/qr/${selectedApt._id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      }).then(res => setPaymentData(res.data)).catch(console.error);
    } else {
      setPaymentData(null);
    }
  }, [selectedApt]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/api/appointments/my-appointments', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAppointments(res.data);
      // Cập nhật lại selectedApt để giao diện bên phải thay đổi
      if (selectedApt) {
        const updatedApt = res.data.find(a => a._id === selectedApt._id);
        if (updatedApt) setSelectedApt(updatedApt);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return showAlert('Lỗi', 'Vui lòng nhập lý do hủy lịch', 'error');
    
    showConfirm('Xác nhận hủy', 'Bạn có chắc chắn muốn hủy lịch hẹn này?', async () => {
      try {
        await axios.patch(`/api/appointments/${selectedApt._id}/cancel`, { reason: cancelReason }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setAppointments(prev => prev.map(a => a._id === selectedApt._id ? { ...a, status: 'cancelled', cancellationReason: cancelReason } : a));
        setSelectedApt({ ...selectedApt, status: 'cancelled', cancellationReason: cancelReason });
        setIsCancelModalOpen(false);
        setCancelReason('');
        showAlert('Thành công', 'Đã hủy lịch hẹn', 'success');
      } catch (e) {
        showAlert('Lỗi', e.response?.data?.message || 'Lỗi hủy lịch hẹn', 'error');
      }
    });
  };

  const handleOpenPayment = async (aptId) => {
    try {
      const res = await axios.get(`/api/payments/qr/${aptId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPaymentData(res.data);
    } catch (e) {
      showAlert('Lỗi', e.response?.data?.message || 'Không thể lấy thông tin thanh toán', 'error');
    }
  };

  const handleConfirmPayment = async () => {
    // Để bảo mật đồ án (Không tin tưởng Frontend tự ý đổi trạng thái):
    // Nút này chỉ có nhiệm vụ gọi lại fetchAppointments() để cập nhật trạng thái mới nhất từ Webhook của ngân hàng.
    try {
      setLoading(true);
      await fetchAppointments();
      showAlert(
        'Đang kiểm tra', 
        'Chúng tôi đang kiểm tra giao dịch của bạn với ngân hàng. Hệ thống sẽ tự động cập nhật khi tiền vào tài khoản.', 
        'info'
      );
      setIsPaymentModalOpen(false);
    } catch (e) {
      showAlert('Lỗi', 'Không thể làm mới trạng thái thanh toán', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeService = async (aptId, serviceName) => {
    showConfirm('Xóa dịch vụ', 'Bạn có chắc muốn xóa dịch vụ này khỏi lịch hẹn?', async () => {
      try {
        await axios.patch(`/api/appointments/${aptId}/services/remove`, { serviceName }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        showAlert('Thành công', 'Đã xóa dịch vụ', 'success');
        fetchAppointments();
      } catch (e) {
        showAlert('Lỗi', e.response?.data?.message || 'Lỗi xóa dịch vụ', 'error');
      }
    });
  };

  const handleCashPayment = () => {
    showConfirm('Thanh toán tiền mặt', 'Bạn muốn chọn thanh toán bằng tiền mặt tại phòng khám?', async () => {
      try {
        await axios.patch(`/api/appointments/${selectedApt._id}/select-payment-method`, {
          paymentMethod: 'Cash'
        }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        showAlert('Thành công', 'Đã ghi nhận yêu cầu thanh toán tiền mặt. Vui lòng thanh toán trực tiếp cho nhân viên khi đến khám.', 'success');
        setIsPaymentModalOpen(false);
        fetchAppointments();
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.message || 'Không thể cập nhật phương thức thanh toán', 'error');
      }
    });
  };

  const handleVNPayPayment = async () => {
    if (!selectedApt) return;
    setVnpayLoading(true);
    try {
      const res = await axios.post('/api/payments/vnpay/create-url', {
        appointmentId: selectedApt._id
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        showAlert('Lỗi', 'Không tạo được liên kết thanh toán VNPay', 'error');
      }
    } catch (err) {
      showAlert('Lỗi', err.response?.data?.message || 'Lỗi kết nối cổng VNPay Sandbox', 'error');
    } finally {
      setVnpayLoading(false);
    }
  };

  const statusConfig = {
    pending: { label: 'Chờ duyệt', className: 'badge-pending', icon: Clock },
    confirmed: { label: 'Đã xác nhận', className: 'badge-confirmed', icon: CheckCircle },
    completed: { label: 'Hoàn thành', className: 'badge-completed', icon: CheckCircle },
    cancelled: { label: 'Đã hủy', className: 'badge-cancelled', icon: XCircle },
  };

  const getStatusBadge = (status) => {
    const cfg = statusConfig[status] || statusConfig.pending;
    return <span className={cfg.className}>{cfg.label}</span>;
  };

  if (loading) return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-16 px-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
        {[1,2,3].map(i => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-200" />)}
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-16 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('my_appointments')}</h1>
            <p className="text-slate-500 mt-1">
              {appointments.length > 0
                ? `${appointments.length} lịch hẹn của bạn`
                : 'Quản lý lịch khám cho thú cưng'}
            </p>
          </div>
          <Link to="/booking" className="btn-primary py-2.5 px-5 text-sm self-start">
            <Plus className="w-4 h-4" /> Đặt lịch mới
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <CalendarCheck className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <p className="text-xl font-semibold text-slate-700 mb-2">Chưa có lịch hẹn nào</p>
            <p className="text-slate-400 text-sm mb-6">Đặt lịch khám đầu tiên cho thú cưng của bạn</p>
            <Link to="/booking" className="btn-primary py-2.5 px-8">
              Đặt lịch ngay <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Appointment list */}
            <div className="lg:col-span-3 space-y-3">
              {appointments.map((app, idx) => {
                const cfg = statusConfig[app.status] || statusConfig.pending;
                const hasNotification = app.status === 'confirmed' && app.clinicNote;
                return (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    onClick={() => setSelectedApt(app)}
                    className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all ${
                      selectedApt?._id === app._id
                        ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <span className="text-sm">🐾</span>
                          </div>
                          <h3 className="font-semibold text-slate-900 truncate">
                            {app.petId?.name || 'Thú cưng'} • {app.services?.map(s => s.name).join(', ') || app.service}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-500 pl-10 line-clamp-1">{app.reason}</p>
                        
                        <div className="mt-2 pl-10 flex flex-wrap gap-2">
                          {app.serviceLocation === 'home' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                              🏠 Tại nhà
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              🏥 Tại phòng khám
                            </span>
                          )}
                          {app.billingDetails?.vetName && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
                              👨‍⚕️ BS. {app.billingDetails.vetName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {getStatusBadge(app.status)}
                        {/* Badge thông báo mới */}
                        {hasNotification && (
                          <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                            <Bell className="w-3 h-3" /> Có thông báo
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pl-10">
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="w-3.5 h-3.5" /> {app.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {app.timeSlot}
                      </span>
                    </div>

                    {app.totalPrice || app.billingDetails?.price || app.estimatedPrice > 0 ? (
                      <div className="mt-3 pl-10 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Tổng chi phí</span>
                        <div className="flex items-center gap-2">
                          {app.paymentStatus === 'Paid' ? (
                            <span className="inline-flex items-center text-[10px] font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-md"><CheckCircle className="w-3 h-3 mr-1" /> Đã thanh toán ({app.paymentMethod})</span>
                          ) : (app.status === 'completed' || app.status === 'confirmed') ? (
                            <span className="inline-flex items-center text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">
                              Chưa thanh toán {app.paymentMethod && app.paymentMethod !== 'Unpaid' ? `(${app.paymentMethod})` : ''}
                            </span>
                          ) : null}
                          <span className="text-sm font-semibold text-blue-600">
                            {formatCurrency(app.totalPrice || app.billingDetails?.price || app.estimatedPrice)}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>

            {/* Appointment detail panel */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                {selectedApt ? (
                  <motion.div
                    key={selectedApt._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-7 shadow-xl"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">Phiếu Lịch Hẹn</h3>
                        <p className="text-slate-500 text-xs">Chi tiết từ phòng khám</p>
                      </div>
                    </div>

                    {/* KHỐI THANH TOÁN (ĐƯA LÊN TRÊN) */}
                    {(selectedApt.status === 'completed' || selectedApt.status === 'confirmed') && selectedApt.billingDetails?.price !== undefined && (
                      <div className="mb-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-slate-600 text-sm font-semibold uppercase tracking-wider">Tổng thanh toán</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {formatCurrency(selectedApt.totalPrice || selectedApt.billingDetails.price)}
                          </span>
                        </div>
                        
                        <div className="flex justify-end">
                          {selectedApt.paymentStatus === 'Paid' ? (
                            <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-100 text-brand-800 rounded-xl border border-brand-200">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-bold">Đã thanh toán ({selectedApt.paymentMethod})</span>
                            </div>
                          ) : (
                            <div className="w-full flex flex-col gap-2">
                              {selectedApt.paymentMethod && selectedApt.paymentMethod !== 'Unpaid' && (
                                <div className="flex items-center justify-center gap-2 bg-amber-100 text-amber-800 px-4 py-2.5 rounded-xl border border-amber-200">
                                  <Clock className="w-5 h-5" />
                                  <span className="font-bold text-sm">Chờ xác nhận thanh toán ({selectedApt.paymentMethod})</span>
                                </div>
                              )}
                              <button 
                                onClick={() => {
                                  setPaymentStep('select');
                                  setIsPaymentModalOpen(true);
                                  if (!selectedApt.allowedPaymentMethods || selectedApt.allowedPaymentMethods.includes('QR')) {
                                    handleOpenPayment(selectedApt._id);
                                  }
                                }}
                                className={`w-full py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                                  selectedApt.paymentMethod && selectedApt.paymentMethod !== 'Unpaid'
                                    ? 'bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50'
                                    : 'btn-primary shadow-lg shadow-blue-500/20'
                                }`}
                              >
                                {selectedApt.paymentMethod && selectedApt.paymentMethod !== 'Unpaid' ? (
                                  <>
                                    <RefreshCw className="w-5 h-5" />
                                    <span>Thay đổi phương thức thanh toán</span>
                                  </>
                                ) : (
                                  <>
                                    <Banknote className="w-5 h-5" />
                                    <span>Thanh toán ngay</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                        <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Thú cưng</p>
                        <p className="font-semibold text-lg text-slate-900">{selectedApt.petId?.name}</p>
                        <div className="mt-2 space-y-1">
                          {selectedApt.services?.map((s, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span>{s.name} - {formatCurrency(s.price)}</span>
                              {selectedApt.status === 'pending' && (
                                <button onClick={() => removeService(selectedApt._id, s.name)} className="text-red-500 text-xs hover:underline">
                                  Xóa
                                </button>
                              )}
                            </div>
                          )) || (
                            <p className="text-slate-600 text-sm">{selectedApt.service}</p>
                          )}
                          <p className="font-semibold text-slate-900 text-sm">Tổng: {formatCurrency(selectedApt.estimatedPrice || selectedApt.totalPrice || selectedApt.billingDetails?.price)}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                        <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Thời gian</p>
                        <p className="font-semibold text-slate-900">{selectedApt.date}</p>
                        <p className="text-slate-600 text-sm">{selectedApt.timeSlot}</p>
                      </div>

                      {/* Trạng thái chờ duyệt */}
                      {selectedApt.status === 'pending' && (
                        <div className="bg-amber-500/20 border border-amber-500/30 p-4 rounded-xl text-center">
                          <Clock className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                          <p className="text-amber-300 text-sm font-medium">Đang chờ phòng khám xác nhận</p>
                          <p className="text-amber-400/70 text-xs mt-1">Thường trong vòng 24h</p>
                        </div>
                      )}

                      {/* Thông báo xác nhận từ bác sĩ — NỔI BẬT */}
                      {(selectedApt.status === 'confirmed' || selectedApt.status === 'completed') && selectedApt.clinicNote && (
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                          <p className="text-xs text-blue-700 font-bold mb-2 flex items-center gap-1.5">
                            <Bell className="w-3.5 h-3.5" /> THÔNG BÁO TỪ BÁC SĨ
                          </p>
                          <p className="text-sm text-slate-800 leading-relaxed">{selectedApt.clinicNote}</p>
                        </div>
                      )}

                      {/* Thông tin địa điểm */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                        <p className="text-slate-400 text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Địa điểm khám</p>
                        {selectedApt.serviceLocation === 'home' ? (
                          <>
                            <p className="font-semibold text-amber-600 mb-1">🏠 Khám tại nhà</p>
                            <p className="text-sm text-slate-700">{selectedApt.homeAddress}</p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-blue-600 mb-1">🏥 Tại phòng khám</p>
                            <p className="text-sm text-slate-700">{selectedApt.billingDetails?.clinicAddress || '123 Đường Y Tế, Phường Thú Cưng, Quận 1'}</p>
                          </>
                        )}
                      </div>

                      {selectedApt.billingDetails && (
                        <div className="space-y-3">
                          {selectedApt.billingDetails.vetName && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-slate-500" />
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Bác sĩ phụ trách</p>
                                <p className="font-medium text-sm text-slate-900">{selectedApt.billingDetails.vetName}</p>
                              </div>
                            </div>
                          )}
                          {selectedApt.billingDetails.vetPhone && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <Phone className="w-4 h-4 text-slate-500" />
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Hotline liên hệ</p>
                                <p className="font-medium text-sm text-slate-900">{selectedApt.billingDetails.vetPhone}</p>
                              </div>
                            </div>
                          )}
                          {selectedApt.billingDetails?.price !== undefined && (
                            <div className="border-t border-slate-200 pt-4 space-y-2 mt-4">
                              {selectedApt.travelFee > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-500">Phí dịch vụ</span>
                                  <span className="text-slate-900 font-medium">{formatCurrency(selectedApt.billingDetails.price)}</span>
                                </div>
                              )}
                              {selectedApt.travelFee > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-500">Phí di chuyển (tại nhà)</span>
                                  <span className="text-slate-900 font-medium">{formatCurrency(selectedApt.travelFee)}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {selectedApt.status === 'cancelled' && (
                        <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl text-center">
                          <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                          <p className="text-red-300 text-sm font-medium mb-1">Lịch hẹn đã bị hủy</p>
                          <p className="text-red-200/70 text-xs">Lý do: {selectedApt.cancellationReason || 'Không có lý do'}</p>
                        </div>
                      )}

                      {/* Nút hủy lịch */}
                      {(selectedApt.status === 'pending' || selectedApt.status === 'confirmed') && (
                        <button
                          onClick={() => setIsCancelModalOpen(true)}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/10 transition-colors mt-6"
                        >
                          <XCircle className="w-4 h-4" /> Hủy lịch hẹn này
                        </button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center h-56 flex flex-col items-center justify-center">
                    <FileText className="w-10 h-10 text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium text-sm">Chọn một lịch hẹn để xem chi tiết</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal Mới */}
        {isPaymentModalOpen && selectedApt && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl overflow-hidden relative">
              
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-xl tracking-tight text-slate-900">
                  {paymentStep === 'select' ? 'Phương thức thanh toán' : 
                   paymentStep === 'qr' ? 'Thanh toán VietQR' : 'Thanh toán Tiền mặt'}
                </h3>
                <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 hover:text-slate-800 transition-colors">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {selectedApt.allowedPaymentMethods?.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p>Lịch hẹn này không có phương thức thanh toán hợp lệ.<br/>Vui lòng liên hệ lễ tân.</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {paymentStep === 'select' && (
                    <motion.div key="select" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
                      {(!selectedApt.allowedPaymentMethods || selectedApt.allowedPaymentMethods.includes('VNPay') || true) && (
                        <button 
                          onClick={handleVNPayPayment} 
                          disabled={vnpayLoading}
                          className="w-full group flex items-center p-4 border border-rose-100 bg-rose-50/50 rounded-2xl hover:bg-rose-50 hover:border-rose-300 transition-all text-left disabled:opacity-50"
                        >
                          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform font-black text-xs">
                            VNPAY
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-800 text-lg">Thanh toán bằng ngân hàng</h4>
                              <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">ATM / Thẻ</span>
                            </div>
                            <p className="text-sm text-slate-500">Cổng thanh toán VNPay (Thẻ nội địa & Quốc tế)</p>
                          </div>
                          {vnpayLoading ? (
                            <RefreshCw className="w-5 h-5 text-rose-500 animate-spin" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-rose-400 group-hover:text-rose-600" />
                          )}
                        </button>
                      )}

                      {(!selectedApt.allowedPaymentMethods || selectedApt.allowedPaymentMethods.includes('QR')) && (
                        <button onClick={() => setPaymentStep('qr')} className="w-full group flex items-center p-4 border border-blue-100 bg-blue-50/50 rounded-2xl hover:bg-blue-50 hover:border-blue-300 transition-all text-left">
                          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                            <QrCode className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 text-lg">Chuyển khoản VietQR</h4>
                            <p className="text-sm text-slate-500">Quét mã QR tiện lợi, tự động cập nhật</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-blue-400 group-hover:text-blue-600" />
                        </button>
                      )}
                      
                      {(!selectedApt.allowedPaymentMethods || selectedApt.allowedPaymentMethods.includes('Cash')) && (
                        <button onClick={() => setPaymentStep('cash')} className="w-full group flex items-center p-4 border border-slate-200 bg-slate-50/50 rounded-2xl hover:bg-slate-100 hover:border-slate-300 transition-all text-left">
                          <div className="w-12 h-12 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                            <Banknote className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 text-lg">Tiền mặt tại quầy</h4>
                            <p className="text-sm text-slate-500">Thanh toán trực tiếp cho nhân viên</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                        </button>
                      )}
                    </motion.div>
                  )}

                  {paymentStep === 'qr' && (
                    <motion.div key="qr" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="text-center">
                      {paymentData ? (
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                          <div className="bg-white p-3 rounded-2xl shadow-sm inline-block mb-4">
                            <img src={paymentData.qrUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
                          </div>
                          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-sm text-slate-700 mb-4 text-left space-y-2">
                            <div className="flex justify-between border-b border-blue-100/50 pb-2">
                              <span className="text-slate-500">Ngân hàng</span>
                              <span className="font-bold">{paymentData.bankId}</span>
                            </div>
                            <div className="flex justify-between border-b border-blue-100/50 pb-2">
                              <span className="text-slate-500">Số tiền</span>
                              <span className="font-bold text-blue-700">{formatCurrency(selectedApt.totalPrice || selectedApt.billingDetails.price)}</span>
                            </div>
                            <div className="flex flex-col gap-1 pt-1">
                              <span className="text-slate-500">Nội dung (Bắt buộc)</span>
                              <span className="font-mono bg-yellow-100 px-2 py-1 rounded text-center font-bold tracking-wider select-all">{paymentData.content}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-3">
                            <p className="text-xs font-semibold text-amber-600 mb-1 flex items-center justify-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> Vui lòng hoàn tất chuyển khoản trước khi nhấn Xác nhận
                            </p>
                            <button onClick={handleConfirmPayment} className="w-full btn-primary py-3 rounded-xl shadow-lg shadow-blue-500/30 text-sm">
                              Tôi đã chuyển khoản thành công
                            </button>
                            <button onClick={() => setPaymentStep('select')} className="w-full btn-ghost text-slate-500 py-3 rounded-xl text-sm hover:bg-slate-200">
                              Chọn phương thức khác
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 flex flex-col items-center justify-center">
                          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                          <p className="text-slate-500 text-sm">Đang tải mã VietQR...</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {paymentStep === 'cash' && (
                    <motion.div key="cash" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="text-center py-4">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <Banknote className="w-10 h-10 text-slate-600" />
                      </div>
                      <p className="text-slate-600 mb-8 px-4">
                        Bạn đã chọn thanh toán bằng tiền mặt. Vui lòng chuẩn bị số tiền <strong className="text-slate-900">{formatCurrency(selectedApt.totalPrice || selectedApt.billingDetails.price)}</strong> và thanh toán trực tiếp tại quầy lễ tân.
                      </p>
                      <div className="flex flex-col gap-3">
                        <button onClick={handleCashPayment} className="w-full btn-primary !bg-slate-800 !hover:bg-slate-900 py-3 rounded-xl shadow-lg shadow-slate-900/20 text-sm">
                          Xác nhận thanh toán tiền mặt
                        </button>
                        <button onClick={() => setPaymentStep('select')} className="w-full btn-ghost text-slate-500 py-3 rounded-xl text-sm hover:bg-slate-200">
                          Quay lại
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          </div>
        )}

        {/* Cancel Modal */}
        {isCancelModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="font-bold text-lg text-slate-900 mb-2">Hủy lịch hẹn</h3>
              <p className="text-sm text-slate-500 mb-4">Vui lòng cho phòng khám biết lý do bạn hủy lịch:</p>
              <form onSubmit={handleCancel}>
                <textarea
                  required rows="3"
                  value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                  placeholder="Ví dụ: Bận đột xuất, không sắp xếp được thời gian..."
                  className="input-field resize-none mb-4 w-full"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsCancelModalOpen(false)} className="btn-secondary flex-1">Đóng</button>
                  <button type="submit" className="btn-primary flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600">Xác nhận hủy</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
