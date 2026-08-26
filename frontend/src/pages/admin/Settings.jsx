import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Banknote, Save, CheckCircle, ExternalLink, AlertCircle, Copy, Info } from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../../contexts/AlertContext';

const BANK_OPTIONS = [
  { value: 'VCB', label: 'Vietcombank (VCB)' },
  { value: 'TCB', label: 'Techcombank (TCB)' },
  { value: 'MB', label: 'MB Bank (MB)' },
  { value: 'VPB', label: 'VPBank (VPB)' },
  { value: 'ACB', label: 'ACB Bank (ACB)' },
  { value: 'BIDV', label: 'BIDV' },
  { value: 'VTB', label: 'Vietinbank (VTB)' },
  { value: 'HDB', label: 'HDBank (HDB)' },
  { value: 'TPB', label: 'TPBank (TPB)' },
  { value: 'MSB', label: 'MSB Bank (MSB)' },
  { value: 'OCB', label: 'OCB Bank (OCB)' },
  { value: 'SHB', label: 'SHB Bank (SHB)' },
  { value: 'STB', label: 'Sacombank (STB)' },
  { value: 'CAKE', label: 'CAKE by VPBank' },
  { value: 'TIMO', label: 'TIMO' },
  { value: 'MOMO', label: 'MoMo' },
];

export default function Settings() {
  const [bankId, setBankId] = useState(import.meta.env.VITE_BANK_ID || 'VCB');
  const [accountNo, setAccountNo] = useState(import.meta.env.VITE_BANK_ACCOUNT || '');
  const [accountName, setAccountName] = useState(import.meta.env.VITE_BANK_NAME || '');
  const [saved, setSaved] = useState(false);
  const [previewQR, setPreviewQR] = useState('');
  const [copiedNgrok, setCopiedNgrok] = useState(false);
  
  // Mock Webhook State
  const [mockId, setMockId] = useState('');
  const [mocking, setMocking] = useState(false);
  const { showAlert } = useAlert();
  
  // Preview QR (dùng VietQR API)
  const generatePreview = () => {
    if (!bankId || !accountNo || !accountName) return;
    const name = encodeURIComponent(accountName);
    const url = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=50000&addInfo=Test+QR+Preview&accountName=${name}`;
    setPreviewQR(url);
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Lưu vào localStorage để frontend đọc (backend đọc từ .env)
    localStorage.setItem('clinic_bank_id', bankId);
    localStorage.setItem('clinic_bank_account', accountNo);
    localStorage.setItem('clinic_bank_name', accountName);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    generatePreview();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedNgrok(true);
      setTimeout(() => setCopiedNgrok(false), 2000);
    });
  };

  const handleMockWebhook = async () => {
    if (!mockId) return showAlert('Lỗi', 'Vui lòng nhập ID lịch hẹn', 'warning');
    setMocking(true);
    try {
      const token = JSON.parse(sessionStorage.getItem('user'))?.token;
      const res = await axios.post('/api/payments/mock-webhook', 
        { appointmentId: mockId.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert('Thành công', res.data.message, 'success');
      setMockId('');
    } catch (error) {
      showAlert('Thất bại', error.response?.data?.message || 'Lỗi giả lập', 'error');
    } finally {
      setMocking(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      {/* Header Bento */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] ring-1 ring-slate-200 dark:ring-white/10 shadow-sm flex flex-col justify-center">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Cài đặt hệ thống</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Cấu hình thông tin thanh toán QR và tích hợp webhook</p>
      </div>

      {/* QR Bank Config */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] ring-1 ring-slate-200 dark:ring-white/10 shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 p-6 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-brand-50/50 to-cyan-50/50 dark:from-brand-500/5 dark:to-cyan-500/5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Cấu hình QR Thanh toán</h2>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">Thông tin tài khoản ngân hàng để tạo mã QR VietQR</p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="bg-amber-50 dark:bg-amber-500/10 ring-1 ring-amber-200 dark:ring-amber-500/30 rounded-2xl p-5 mb-8 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm font-medium text-amber-800 dark:text-amber-400">
              <p className="font-bold mb-1 tracking-tight text-base">Lưu ý quan trọng</p>
              <p className="leading-relaxed">Thay đổi tại đây chỉ có tác dụng xem trước. Để thay đổi vĩnh viễn, hãy cập nhật file <code className="bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded-lg font-mono text-xs font-bold ring-1 ring-amber-200 dark:ring-amber-700/50">.env</code> trong backend với các biến: <code className="bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded-lg font-mono text-xs font-bold ring-1 ring-amber-200 dark:ring-amber-700/50">BANK_ID</code>, <code className="bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded-lg font-mono text-xs font-bold ring-1 ring-amber-200 dark:ring-amber-700/50">BANK_ACCOUNT</code>, <code className="bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded-lg font-mono text-xs font-bold ring-1 ring-amber-200 dark:ring-amber-700/50">BANK_NAME</code></p>
            </div>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Ngân hàng</label>
              <select value={bankId} onChange={e => setBankId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950/50 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-brand-500 transition-all cursor-pointer">
                {BANK_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Số tài khoản</label>
              <input type="text" value={accountNo} onChange={e => setAccountNo(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/50 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-brand-500 transition-all placeholder:text-slate-400" placeholder="0123456789" required />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tên tài khoản</label>
              <input type="text" value={accountName} onChange={e => setAccountName(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 dark:bg-slate-950/50 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-brand-500 transition-all placeholder:text-slate-400 uppercase" placeholder="PHONG KHAM THU CUNG KT" required />
              <p className="text-[10px] font-bold text-slate-400 mt-2">Nhập IN HOA như trên tài khoản ngân hàng</p>
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-2">
              <button type="submit" className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 active:scale-95">
                {saved ? <><CheckCircle className="w-5 h-5" /> Đã lưu!</> : <><Save className="w-5 h-5" /> Lưu & Xem thử</>}
              </button>
              <button type="button" onClick={generatePreview} className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95">
                <QrCode className="w-5 h-5" /> Xem QR mẫu
              </button>
            </div>
          </form>

          {/* QR Preview */}
          <AnimatePresence>
          {previewQR && (
            <motion.div
              initial={{ opacity: 0, y: 12, height: 0 }} 
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 overflow-hidden"
            >
              <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 flex flex-col sm:flex-row items-center gap-8">
                <div className="bg-white p-3 rounded-2xl shadow-sm ring-1 ring-slate-200">
                  <img src={previewQR} alt="QR Preview" className="w-40 h-40 object-contain" />
                </div>
                <div>
                  <p className="font-bold text-lg text-slate-900 dark:text-white tracking-tight mb-2">QR mẫu (50,000₫ - Test)</p>
                  <div className="space-y-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <p>🏦 Ngân hàng: <strong className="text-slate-900 dark:text-white">{BANK_OPTIONS.find(b => b.value === bankId)?.label}</strong></p>
                    <p>💳 Số TK: <strong className="text-slate-900 dark:text-white">{accountNo}</strong></p>
                    <p>👤 Tên TK: <strong className="text-slate-900 dark:text-white">{accountName}</strong></p>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mt-4 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Có thể quét bằng bất kỳ app ngân hàng nào
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>

      {/* Webhook / Ngrok guide */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] ring-1 ring-slate-200 dark:ring-white/10 shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 p-6 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-violet-50/50 to-indigo-50/50 dark:from-violet-500/5 dark:to-indigo-500/5">
          <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
            <ExternalLink className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Cấu hình Webhook tự động (ngrok)</h2>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">Cho phép QR tự động xác nhận khi quét — như bạn của bạn làm</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-brand-50 dark:bg-brand-500/10 ring-1 ring-brand-200 dark:ring-brand-500/30 rounded-2xl p-5 flex items-start gap-4">
            <Info className="w-5 h-5 text-brand-600 dark:text-brand-500 shrink-0 mt-0.5" />
            <div className="text-sm font-medium text-brand-800 dark:text-brand-400">
              <p className="font-bold mb-1 tracking-tight text-base">Cách hoạt động</p>
              <p className="leading-relaxed">Khi khách quét QR và chuyển tiền → Ngân hàng gửi thông báo đến webhook URL → Server tự động đánh dấu "Đã thanh toán" → Giao diện tự cập nhật. Không cần admin phải tick thủ công!</p>
            </div>
          </div>

          {[
            {
              step: '1',
              title: 'Tải và cài ngrok',
              code: '# Tải ngrok tại:\nhttps://ngrok.com/download\n\n# Hoặc cài qua scoop (Windows)\nscoop install ngrok\n\n# Sau đó đăng ký tài khoản miễn phí tại ngrok.com',
              note: 'Tài khoản free: 1 URL tĩnh/tháng, không cần thẻ tín dụng',
            },
            {
              step: '2',
              title: 'Chạy ngrok expose port backend',
              code: '# Mở terminal, chạy lệnh này:\nngrok http 5000\n\n# Kết quả sẽ hiện:\n# Forwarding: https://abc123.ngrok-free.app -> localhost:5000\n# Copy URL https đó lại',
              note: 'Để ngrok chạy trong suốt quá trình demo',
            },
            {
              step: '3',
              title: 'Đăng ký Webhook tại Casso.vn (miễn phí)',
              code: '# 1. Truy cập: https://casso.vn\n# 2. Kết nối tài khoản ngân hàng\n# 3. Vào Settings → Webhook:\n\nWebhook URL:\nhttps://YOUR-NGROK-URL.ngrok-free.app/api/payments/webhook\n\n# 4. Lưu và test webhook',
              note: 'Casso.vn miễn phí cho 1 tài khoản ngân hàng',
            },
            {
              step: '4',
              title: 'Đơn giản hơn: Dùng sepay.vn',
              code: '# 1. Truy cập: https://sepay.vn\n# 2. Tạo tài khoản miễn phí\n# 3. Kết nối ngân hàng\n# 4. Webhook URL:\nhttps://YOUR-NGROK-URL.ngrok-free.app/api/payments/webhook\n\n# Sepay hỗ trợ hầu hết ngân hàng VN',
              note: 'Sepay thường dễ setup hơn Casso',
            },
          ].map(({ step, title, code, note }) => (
            <div key={step} className="ring-1 ring-slate-200 dark:ring-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-4 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-white/10">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0 shadow-inner"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                  {step}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
              </div>
              <div className="relative">
                <pre className="p-5 text-[13px] text-green-400 bg-slate-900 overflow-x-auto leading-relaxed font-mono custom-scrollbar">
                  <code>{code}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(code)}
                  className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors backdrop-blur"
                  title="Copy"
                >
                  {copiedNgrok ? <CheckCircle className="w-4 h-4 text-brand-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {note && (
                <p className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-white/10 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> {note}
                </p>
              )}
            </div>
          ))}

          <div className="bg-amber-50 dark:bg-amber-500/10 ring-1 ring-amber-200 dark:ring-amber-500/30 rounded-2xl p-5 text-sm font-medium text-amber-800 dark:text-amber-400">
            <p>Admin có thể dùng nút <strong className="font-bold text-brand-700 dark:text-brand-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded ring-1 ring-brand-200 dark:ring-brand-500/30 mx-1">QR ✓</strong> trong trang quản lý lịch hẹn để xác nhận thủ công sau khi kiểm tra biến động tài khoản ngân hàng trên điện thoại cá nhân.</p>
          </div>
        </div>
      </div>

      {/* Mock Webhook / Demo Tool */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] ring-1 ring-slate-200 dark:ring-white/10 shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 p-6 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-500/5 dark:to-amber-500/5">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Công cụ Giả lập Thanh toán (Dành cho Demo)</h2>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">Kích hoạt webhook ảo để báo cáo giảng viên mà không cần chuyển tiền thật</p>
          </div>
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="bg-orange-50 dark:bg-orange-500/10 ring-1 ring-orange-200 dark:ring-orange-500/30 rounded-2xl p-5 mb-6 text-sm font-medium text-orange-800 dark:text-orange-400">
            <p>Công cụ này sẽ gửi một tín hiệu ảo đến máy chủ, giả vờ rằng ngân hàng vừa báo có tiền. Lịch hẹn sẽ lập tức chuyển sang trạng thái <strong className="font-bold">Đã thanh toán (Paid)</strong>.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <input 
              type="text" 
              value={mockId} 
              onChange={e => setMockId(e.target.value)}
              placeholder="Nhập Object ID của lịch hẹn (Copy từ URL hoặc DS)" 
              className="flex-1 bg-slate-50 dark:bg-slate-950/50 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-brand-500 transition-all placeholder:text-slate-400"
            />
            <button 
              onClick={handleMockWebhook} 
              disabled={mocking}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/30 active:scale-95 disabled:opacity-50 disabled:pointer-events-none sm:w-auto w-full"
            >
              {mocking ? 'Đang chạy...' : '🚀 Chạy giả lập'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
