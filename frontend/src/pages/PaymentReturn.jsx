import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, ArrowRight, RefreshCw, CalendarCheck } from 'lucide-react';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const query = searchParams.toString();
        const res = await axios.get(`/api/payments/vnpay/verify-return?${query}`);
        setResult(res.data);
      } catch (err) {
        setResult({
          success: false,
          message: err.response?.data?.message || 'Có lỗi xảy ra khi xác thực giao dịch VNPay'
        });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-3xl p-8 border border-slate-200/80 shadow-2xl text-center relative overflow-hidden"
      >
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-12 h-12 text-brand-600 animate-spin" />
            <h2 className="text-xl font-bold text-slate-800">Đang xác thực giao dịch VNPay...</h2>
            <p className="text-sm text-slate-500">Vui lòng không tắt hoặc tải lại trang</p>
          </div>
        ) : result?.success ? (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                Thanh Toán Thành Công!
              </h2>
              <p className="text-sm text-slate-500">
                Giao dịch của bạn qua cổng VNPay đã được xác nhận hoàn tất.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-3 text-sm">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Số tiền đã trả</span>
                <span className="font-bold text-brand-700 text-base">{formatCurrency(result.amount)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Phương thức</span>
                <span className="font-semibold text-slate-800">Cổng VNPay ({result.bankCode || 'Ngân hàng'})</span>
              </div>
              {result.transactionNo && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Mã GD VNPay</span>
                  <span className="font-mono font-bold text-xs bg-slate-200/70 px-2 py-0.5 rounded">{result.transactionNo}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Link
                to="/my-appointments"
                className="w-full btn-primary py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-brand-500/20"
              >
                <CalendarCheck className="w-5 h-5" />
                <span>Xem lịch hẹn của tôi</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <XCircle className="w-12 h-12" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                Thanh Toán Không Thành Công
              </h2>
              <p className="text-sm text-slate-500">
                {result?.message || 'Giao dịch chưa được hoàn tất hoặc đã bị hủy.'}
              </p>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Link
                to="/my-appointments"
                className="w-full btn-primary !bg-slate-800 !hover:bg-slate-900 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-slate-900/20"
              >
                <ArrowRight className="w-5 h-5" />
                <span>Quay lại trang Lịch hẹn</span>
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
