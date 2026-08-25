import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  CalendarCheck, ShieldCheck, HeartPulse, Clock, Activity,
  Users, ArrowRight, Star, Phone, MapPin, CheckCircle, Sparkles,
  PawPrint, Stethoscope, Scissors, Heart, ChevronLeft, ChevronRight
} from 'lucide-react';

const heroImages = [
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1920&auto=format&fit=crop",
];

const stats = [
  { label: 'Khách hàng', value: '5K+', icon: '👥' },
  { label: 'Ca khám', value: '12K+', icon: '🩺' },
  { label: 'Năm KN', value: '8+', icon: '⭐' },
  { label: 'Bác sĩ', value: '15', icon: '🏥' },
];

const services = [
  { icon: Stethoscope, title: 'Khám Tổng Quát', desc: 'Kiểm tra sức khỏe định kỳ, tiêm phòng và tư vấn dinh dưỡng chi tiết cho thú cưng.', service: 'Khám Tổng Quát', color: 'from-teal-500 to-cyan-500', badge: 'Phổ biến' },
  { icon: Clock, title: 'Cấp Cứu 24/7', desc: 'Sẵn sàng tiếp nhận các ca bệnh khẩn cấp bất kể ngày đêm, đội ngũ luôn trực sẵn.', service: 'Cấp Cứu 24/7', color: 'from-red-500 to-orange-500', badge: '24/7' },
  { icon: ShieldCheck, title: 'Phẫu Thuật', desc: 'Trang thiết bị hiện đại, phòng mổ vô trùng. Đảm bảo an toàn tuyệt đối.', service: 'Phẫu Thuật Y Khoa', color: 'from-violet-500 to-indigo-500', badge: 'HĐ' },
  { icon: Scissors, title: 'Grooming & Spa', desc: 'Cắt tỉa lông chuyên nghiệp, tắm thơm và chăm sóc sắc đẹp. Thú cưng luôn xinh đẹp.', service: 'Grooming & Spa', color: 'from-pink-500 to-rose-500', badge: '✨' },
  { icon: Activity, title: 'Xét Nghiệm & CT', desc: 'Chẩn đoán chính xác với máy X-quang, siêu âm và hệ thống xét nghiệm hiện đại.', service: 'Xét Nghiệm - CT', color: 'from-amber-500 to-orange-500', badge: 'Hi-tech' },
  { icon: Heart, title: 'Nội Khoa', desc: 'Điều trị các bệnh lý nội khoa phức tạp với phác đồ khoa học, theo dõi liên tục.', service: 'Nội Khoa', color: 'from-emerald-500 to-teal-500', badge: 'Chuyên sâu' },
];

const testimonials = [
  { name: 'Nguyễn Thị Lan', pet: 'Cún Golden', text: 'Đội ngũ bác sĩ rất tận tâm! Bé Max nhà tôi được chăm sóc rất tốt, từ khâu đặt lịch đến khi khám xong.', avatar: '🐕', rating: 5 },
  { name: 'Trần Văn Hùng', pet: 'Mèo Maine Coon', text: 'Dịch vụ tốt, phòng khám sạch sẽ và hiện đại. Bác sĩ giải thích chi tiết tình trạng sức khỏe của bé.', avatar: '🐈', rating: 5 },
  { name: 'Phạm Minh Châu', pet: 'Thỏ Hà Lan', text: 'Rất hài lòng với dịch vụ đặt lịch online tiện lợi. Không cần chờ đợi, đúng giờ là vào khám ngay.', avatar: '🐇', rating: 5 },
  { name: 'Lê Thu Hà', pet: 'Hamster', text: 'Là phòng khám duy nhất ở khu vực tôi chấp nhận khám hamster. Bác sĩ rất hiểu bé!', avatar: '🐹', rating: 5 },
];

const whyUs = [
  { icon: '🏥', title: 'Cơ sở vật chất hiện đại', desc: 'Trang thiết bị y tế nhập khẩu, phòng khám đạt tiêu chuẩn quốc tế' },
  { icon: '🩺', title: 'Bác sĩ giàu kinh nghiệm', desc: 'Đội ngũ 15+ bác sĩ thú y được đào tạo bài bản trong và ngoài nước' },
  { icon: '📱', title: 'Đặt lịch siêu tiện', desc: 'Đặt lịch online 24/7, nhận thông báo qua SMS và email tức thì' },
  { icon: '💰', title: 'Giá cả minh bạch', desc: 'Báo giá trước khi khám, thanh toán tiện lợi qua QR code hoặc tiền mặt' },
  { icon: '🚗', title: 'Khám tại nhà', desc: 'Bác sĩ đến tận nơi nếu thú cưng của bạn không thể di chuyển' },
  { icon: '❤️', title: 'Chăm sóc tận tâm', desc: 'Đối xử với mọi thú cưng như thành viên gia đình' },
];

export default function Home() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [staffs, setStaffs] = useState([]);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx(i => (i + 1) % testimonials.length), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    axios.get('/api/staffs').then(res => setStaffs(res.data.slice(0, 4))).catch(() => {});
  }, []);

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  };

  return (
    <div className="overflow-x-hidden">
      {/* ====== HERO ====== */}
      <section className="relative h-[92vh] min-h-[620px] flex items-center overflow-hidden">
        {/* Background slideshow */}
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIdx}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <img
              src={heroImages[heroIdx]}
              alt="KT Pet Clinic"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full pb-24 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/20 text-teal-300 text-xs font-semibold rounded-full border border-teal-500/30 mb-5 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Phòng khám thú cưng hàng đầu TP.HCM
            </span>

            <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
              Sức khoẻ<br />
              <span className="text-gradient-teal">thú cưng</span><br />
              của bạn
            </h1>

            <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-md">
              Đội ngũ bác sĩ chuyên nghiệp, trang thiết bị hiện đại. Đặt lịch khám online, thanh toán QR tiện lợi.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/booking" className="btn-primary py-3.5 px-7 text-base shine">
                <CalendarCheck className="w-5 h-5" />
                Đặt lịch ngay
              </Link>
              <a href="tel:0901234567" className="flex items-center gap-2 py-3.5 px-7 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-white font-semibold border border-white/20 transition text-base">
                <Phone className="w-5 h-5" />
                Gọi ngay
              </a>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="absolute bottom-0 left-0 right-0 z-10"
        >
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid grid-cols-4 divide-x divide-white/10 bg-white/10 backdrop-blur-xl rounded-t-2xl border border-white/15 border-b-0 overflow-hidden">
              {stats.map(({ label, value, icon }) => (
                <div key={label} className="flex flex-col items-center py-5 px-4">
                  <span className="text-2xl mb-1">{icon}</span>
                  <span className="text-2xl font-black text-white">{value}</span>
                  <span className="text-xs text-slate-300 font-medium mt-0.5">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Slide dots */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`w-1.5 rounded-full transition-all duration-300 ${i === heroIdx ? 'h-8 bg-teal-400' : 'h-3 bg-white/30'}`}
            />
          ))}
        </div>
      </section>

      {/* ====== SERVICES ====== */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="section-label">Dịch vụ của chúng tôi</span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Chăm sóc <span className="text-gradient-teal">toàn diện</span>
            </h2>
            <p className="text-slate-500 mt-3 max-w-md mx-auto">
              Từ khám định kỳ đến phẫu thuật phức tạp — mọi nhu cầu của thú cưng đều được đáp ứng.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc, idx) => {
              const Icon = svc.icon;
              return (
                <motion.div
                  key={svc.title}
                  {...fadeUp}
                  transition={{ delay: idx * 0.07, duration: 0.5 }}
                  className="card-hover group p-6 relative overflow-hidden"
                >
                  {/* Badge */}
                  <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {svc.badge}
                  </span>

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${svc.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-teal-700 transition-colors">{svc.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{svc.desc}</p>

                  <Link
                    to={`/booking?service=${encodeURIComponent(svc.service)}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 hover:gap-2 transition-all"
                  >
                    Đặt lịch ngay <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  {/* Hover gradient bar */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${svc.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                </motion.div>
              );
            })}
          </div>

          <motion.div {...fadeUp} className="text-center mt-8">
            <Link to="/booking" className="btn-secondary inline-flex py-3 px-8">
              Xem tất cả dịch vụ <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ====== WHY US ====== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <span className="section-label">Tại sao chọn chúng tôi</span>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-6">
                Chúng tôi khác biệt<br />
                ở <span className="text-gradient-teal">sự tận tâm</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {whyUs.map(({ icon, title, desc }, idx) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-start gap-3 p-4 rounded-2xl hover:bg-teal-50/60 hover:border-teal-200 border border-transparent transition-all"
                  >
                    <span className="text-2xl shrink-0">{icon}</span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Image collage */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.2 }}
              className="relative h-[500px] hidden lg:block"
            >
              <img
                src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=80&w=800&auto=format&fit=crop"
                alt="Vet examining pet"
                className="absolute top-0 left-0 w-[65%] h-[65%] rounded-3xl object-cover shadow-xl"
              />
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop"
                alt="Happy pets"
                className="absolute bottom-0 right-0 w-[60%] h-[55%] rounded-3xl object-cover shadow-xl"
              />
              {/* Floating card */}
              <div className="absolute bottom-[30%] left-[15%] card-glass px-4 py-3 rounded-2xl z-10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Top 1 TP.HCM</p>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== TEAM ====== */}
      {staffs.length > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <motion.div {...fadeUp} className="text-center mb-12">
              <span className="section-label">Đội ngũ y tế</span>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                Gặp gỡ <span className="text-gradient-teal">bác sĩ</span> của chúng tôi
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {staffs.map((s, idx) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="card text-center p-5 group hover:-translate-y-2 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4 shadow-md ring-2 ring-teal-100 group-hover:ring-teal-300 transition-all">
                    {s.image ? (
                      <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full avatar-initials text-2xl font-black">
                        {s.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                  <p className="text-xs text-teal-600 mt-1 font-medium">
                    {s.role === 'Veterinarian' ? 'Bác sĩ Thú y' :
                     s.role === 'Groomer' ? 'Chuyên viên Grooming' :
                     s.role === 'Nurse' ? 'Y tá' : s.role}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to="/about" className="btn-secondary inline-flex py-3 px-8">
                Xem toàn bộ đội ngũ <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ====== TESTIMONIALS ====== */}
      <section className="py-20 bg-gradient-brand relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-10">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1.5 bg-white/15 text-white text-xs font-semibold rounded-full border border-white/20 mb-4">
              💬 Khách hàng nói gì
            </span>
            <h2 className="text-4xl font-black text-white tracking-tight">
              Họ tin tưởng chúng tôi
            </h2>
          </motion.div>

          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="card-glass rounded-3xl p-8 text-center"
              >
                <div className="text-5xl mb-4">{testimonials[testimonialIdx].avatar}</div>
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(testimonials[testimonialIdx].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-slate-700 text-lg leading-relaxed mb-5 font-medium italic">
                  "{testimonials[testimonialIdx].text}"
                </blockquote>
                <p className="font-bold text-slate-900">{testimonials[testimonialIdx].name}</p>
                <p className="text-sm text-teal-600">Chủ nhân của {testimonials[testimonialIdx].pet}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIdx(i)}
                className={`rounded-full transition-all duration-300 ${i === testimonialIdx ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-teal">
              <PawPrint className="w-10 h-10 text-teal-600" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
              Thú cưng của bạn<br />
              xứng đáng được <span className="text-gradient-teal">chăm sóc tốt nhất</span>
            </h2>
            <p className="text-slate-500 text-lg mb-8">
              Đặt lịch khám ngay hôm nay. Đội ngũ bác sĩ của chúng tôi luôn sẵn sàng phục vụ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking" className="btn-primary py-4 px-10 text-base shine">
                <CalendarCheck className="w-5 h-5" />
                Đặt lịch ngay
              </Link>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary py-4 px-10 text-base"
              >
                <MapPin className="w-5 h-5" />
                Xem bản đồ
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
