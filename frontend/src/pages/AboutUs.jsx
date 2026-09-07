import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Phone, Mail, Clock, CheckCircle, Users, Award, Stethoscope, Heart, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import MapEmbed from '../components/MapEmbed';

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
};

const stats = [
  { value: '8+', label: 'Năm kinh nghiệm', icon: Award },
  { value: '5,000+', label: 'Khách hàng thân thiết', icon: Users },
  { value: '12,000+', label: 'Ca khám thành công', icon: CheckCircle },
  { value: '15', label: 'Bác sĩ chuyên khoa', icon: Stethoscope },
];

const values = [
  { emoji: '💙', title: 'Tận tâm', desc: 'Mỗi thú cưng là một cá thể độc đáo, xứng đáng được chăm sóc cá nhân hóa.' },
  { emoji: '🔬', title: 'Chuyên nghiệp', desc: 'Ứng dụng y học hiện đại và thiết bị tiên tiến nhất cho mỗi ca điều trị.' },
  { emoji: '🤝', title: 'Tin cậy', desc: 'Minh bạch trong chi phí, thành thật trong tư vấn — luôn đặt quyền lợi thú cưng lên hàng đầu.' },
  { emoji: '🌱', title: 'Bền vững', desc: 'Cam kết với môi trường và cộng đồng yêu động vật tại Việt Nam.' },
];

const storyGallery = [
  {
    url: "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?q=80&w=1200&auto=format&fit=crop",
    title: "Chăm sóc phục hồi sau phẫu thuật (Bé Cún Pug)",
    badge: "Phục hồi chức năng 🐶",
    tag: "Chuyên khoa Ngoại"
  },
  {
    url: "https://images.unsplash.com/photo-1561948955-570b270e7c36?q=80&w=1200&auto=format&fit=crop",
    title: "Khu vực điều trị tĩnh dưỡng riêng biệt cho các bé Mèo",
    badge: "Cat-Friendly Clinic 🐱",
    tag: "Chuyên khoa Mèo"
  },
  {
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1200&auto=format&fit=crop",
    title: "Khám định kỳ & tầm soát sức khỏe toàn diện cho Mèo cưng",
    badge: "Chăm sóc Mèo cưng 🐈",
    tag: "Khoa Nội & Miễn dịch"
  },
  {
    url: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=1200&auto=format&fit=crop",
    title: "Đồng hành yêu thương cùng Chó & Mèo như người thân",
    badge: "Gia đình thú cưng 🐾",
    tag: "Tận tâm đồng hành"
  }
];

export default function AboutUs() {
  const [staffs, setStaffs] = useState([]);
  const [storyIdx, setStoryIdx] = useState(0);
  const { lang } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setStoryIdx(i => (i + 1) % storyGallery.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const res = await axios.get('/api/staffs');
        setStaffs(res.data);
      } catch (error) {
        console.error('Error fetching staffs', error);
      }
    };
    fetchStaffs();
  }, []);

  return (
    <div className="bg-white text-slate-900 font-sans min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-28 px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-5">Về chúng tôi</p>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              {lang === 'vi' ? 'Chăm sóc thú cưng bằng cả trái tim' : 'Caring for pets with heart'}
            </h1>
            <p className="text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto">
              {lang === 'vi'
                ? 'KT Pet Clinic được thành lập với sứ mệnh mang lại cuộc sống khỏe mạnh nhất cho thú cưng. Chúng tôi tin rằng mỗi con vật đều xứng đáng được yêu thương và chăm sóc tốt nhất.'
                : 'KT Pet Clinic was founded with the mission of bringing the healthiest life to pets. We believe every animal deserves the best love and care.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                {...fadeInUp}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold mb-1">{s.value}</div>
                <div className="text-blue-100 text-sm">{s.label}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Story */}
      <section className="py-28 px-6 md:px-12 lg:px-24 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeInUp}>
              <p className="section-label">Câu chuyện của chúng tôi</p>
              <h2 className="text-4xl font-bold tracking-tight mt-2 mb-6">
                {lang === 'vi' ? 'Tầm nhìn & Sứ mệnh' : 'Vision & Mission'}
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  {lang === 'vi'
                    ? 'Được thành lập năm 2018 bởi đội ngũ bác sĩ thú y đam mê và tận tâm, KT Pet Clinic bắt đầu từ một phòng khám nhỏ với mong muốn đơn giản: chăm sóc thú cưng như người thân trong gia đình.'
                    : 'Founded in 2018 by a passionate veterinary team, KT Pet Clinic started as a small clinic with one simple wish: to care for pets like family members.'}
                </p>
                <p>
                  {lang === 'vi'
                    ? 'Sau hơn 8 năm, chúng tôi đã phát triển thành hệ thống phòng khám hiện đại với 15 bác sĩ chuyên khoa, phục vụ hơn 5,000 khách hàng thân thiết. Nhưng cam kết của chúng tôi vẫn không đổi: mỗi thú cưng đều nhận được sự chăm sóc tốt nhất.'
                    : 'After 8+ years, we have grown into a modern clinic system with 15 specialized veterinarians, serving over 5,000 loyal customers. But our commitment remains unchanged: every pet receives the best care.'}
                </p>
              </div>

              <div className="mt-8 space-y-3">
                {['Chứng nhận ISO 9001:2015 về quản lý chất lượng', 'Thành viên Hội Thú y Việt Nam', 'Đối tác của Hill\'s Pet Nutrition'].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="text-slate-700 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="relative group">
              <div className="relative w-full h-96 md:h-[420px] rounded-3xl overflow-hidden shadow-2xl bg-slate-950">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={storyIdx}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <img
                      src={storyGallery[storyIdx].url}
                      alt={storyGallery[storyIdx].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/25" />

                    {/* Badge top left */}
                    <div className="absolute top-5 left-5 backdrop-blur-md bg-black/50 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/20 flex items-center gap-2 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{storyGallery[storyIdx].badge}</span>
                    </div>

                    {/* Tag top right */}
                    <div className="absolute top-5 right-14 backdrop-blur-md bg-blue-600/80 text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/20 shadow-md">
                      {storyGallery[storyIdx].tag}
                    </div>

                    {/* Bottom caption */}
                    <div className="absolute bottom-6 left-6 right-6 text-white pr-16">
                      <p className="text-sm md:text-base font-semibold text-white leading-snug drop-shadow-md">
                        {storyGallery[storyIdx].title}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation arrows */}
                <div className="absolute top-5 right-4 z-10 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setStoryIdx(i => (i - 1 + storyGallery.length) % storyGallery.length)}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-white/30 text-white backdrop-blur-md border border-white/15 transition-transform active:scale-95 shadow-md"
                    aria-label="Previous story image"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setStoryIdx(i => (i + 1) % storyGallery.length)}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-white/30 text-white backdrop-blur-md border border-white/15 transition-transform active:scale-95 shadow-md"
                    aria-label="Next story image"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Indicator dots */}
                <div className="absolute bottom-5 right-6 z-10 flex gap-1.5">
                  {storyGallery.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStoryIdx(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === storyIdx ? 'w-6 bg-blue-400 shadow-md' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
                      aria-label={`Ảnh ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <p className="section-label mx-auto">Giá trị cốt lõi</p>
            <h2 className="text-4xl font-bold tracking-tight mt-2">Những điều chúng tôi tin tưởng</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                {...fadeInUp}
                transition={{ delay: i * 0.08 }}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="text-3xl mb-4">{v.emoji}</div>
                <h3 className="font-bold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {staffs.length > 0 && (
        <section className="py-24 px-6 md:px-12 lg:px-24 bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <p className="section-label mx-auto">Đội ngũ</p>
              <h2 className="text-4xl font-bold tracking-tight mt-2">Những người đồng hành</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {staffs.map((staff, idx) => (
                <motion.div
                  key={staff._id}
                  {...fadeInUp}
                  transition={{ delay: idx * 0.07 }}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="h-64 bg-slate-100 relative overflow-hidden">
                    <img
                      src={staff.image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop'}
                      alt={staff.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop'; }}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{staff.name}</h3>
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{staff.role}</span>
                    {staff.bio && <p className="text-slate-500 text-sm mt-3 leading-relaxed line-clamp-3">{staff.bio}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="mb-16">
            <p className="section-label">Liên hệ</p>
            <h2 className="text-4xl font-bold tracking-tight mt-2">Tìm chúng tôi ở đây</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { Icon: MapPin, label: 'Địa chỉ', value: '123 Đường Y Tế, Phường Thú Cưng, Quận 1, TP.HCM', color: 'text-blue-600 bg-blue-50' },
              { Icon: Phone, label: 'Hotline', value: '0901 234 567\n(Cấp cứu 24/7: 0900 000 911)', color: 'text-brand-600 bg-brand-50' },
              { Icon: Mail, label: 'Email', value: 'contact@ktpetclinic.vn', color: 'text-violet-600 bg-violet-50' },
              { Icon: Clock, label: 'Giờ làm việc', value: 'T2–T6: 08:00 – 20:00\nT7–CN: 08:00 – 18:00', color: 'text-amber-600 bg-amber-50' },
            ].map(c => {
              const CIcon = c.Icon;
              return (
                <motion.div key={c.label} {...fadeInUp} className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
                  <div className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center mb-4`}>
                    <CIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{c.label}</p>
                  <p className="font-semibold text-slate-900 text-sm whitespace-pre-line">{c.value}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====== BẢN ĐỒ ====== */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-10">
            <p className="text-brand-600 text-xs font-bold uppercase tracking-[0.2em] mb-3">Vị trí</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Tìm chúng tôi</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">Chúng tôi nằm ở trung tâm Quận 1, dễ dàng tiếp cận bằng xe máy, ô tô hoặc taxi.</p>
          </motion.div>

          <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
            <MapEmbed
              lat={10.7769}
              lng={106.7009}
              zoom={16}
              height="420px"
              address="123 Đường Y Tế, Phường Thú Cưng, Quận 1, TP.HCM"
            />
          </motion.div>

          <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🚗', label: 'Ô tô / Xe máy', value: 'Có bãi đỗ xe trong khuôn viên' },
              { icon: '🚌', label: 'Xe buýt', value: 'Tuyến 04, 08, 52 — dừng ngay cổng' },
              { icon: '🏍️', label: 'Grab / Be', value: 'Điểm đón thuận tiện, ngay mặt đường lớn' },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
