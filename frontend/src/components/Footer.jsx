import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Stethoscope, ArrowRight } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Trang chủ' },
  { to: '/booking', label: 'Đặt lịch khám' },
  { to: '/reviews', label: 'Đánh giá' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'Giới thiệu' },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">KT <span className="text-blue-400">Clinic</span></span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 text-slate-500">
              Chăm sóc thú cưng toàn diện với trang thiết bị hiện đại. Sức khỏe của thú cưng là ưu tiên hàng đầu.
            </p>
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Đặt lịch ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick nav */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Điều hướng</h3>
            <ul className="space-y-3">
              {navLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-slate-500 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-500">123 Đường Y Tế, Phường Thú Cưng, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <a href="tel:0901234567" className="text-sm text-slate-500 hover:text-white transition">0901 234 567 (24/7)</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <a href="mailto:contact@ktpetclinic.vn" className="text-sm text-slate-500 hover:text-white transition">contact@ktpetclinic.vn</a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Giờ làm việc</h3>
            <ul className="space-y-3 text-sm">
              {[
                { day: 'Thứ 2 – Thứ 6', time: '08:00 – 20:00' },
                { day: 'Thứ 7 – Chủ nhật', time: '08:00 – 18:00' },
              ].map(h => (
                <li key={h.day} className="flex justify-between items-center">
                  <span className="text-slate-500">{h.day}</span>
                  <span className="text-white font-medium">{h.time}</span>
                </li>
              ))}
              <li className="flex justify-between items-center pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4" /> Cấp cứu
                </div>
                <span className="text-red-400 font-bold tracking-wide">24/7</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} KT Pet Clinic. Bảo lưu mọi quyền.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer transition">Điều khoản sử dụng</span>
            <span className="hover:text-slate-400 cursor-pointer transition">Chính sách bảo mật</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
