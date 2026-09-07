import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  CalendarCheck, ShieldCheck, Clock, Activity,
  ArrowRight, Star, Phone, MapPin, Sparkles,
  PawPrint, Stethoscope, Scissors, Heart, ChevronLeft, ChevronRight
} from 'lucide-react';

const heroSlides = [
  {
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1920&auto=format&fit=crop",
    tag: "Mèo Cưng Quý Phái",
    emoji: "🐱",
    badge: "Chăm sóc Mèo cưng chuyên sâu",
    desc: "Môi trường khám riêng biệt, nhẹ nhàng & giảm thiểu căng thẳng cho mèo"
  },
  {
    url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1920&auto=format&fit=crop",
    tag: "Cún Cưng Năng Động",
    emoji: "🐕",
    badge: "Chăm sóc Cún cưng toàn diện",
    desc: "Kiểm tra thể lực định kỳ, phác đồ dinh dưỡng và tiêm phòng tiêu chuẩn"
  },
  {
    url: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=1920&auto=format&fit=crop",
    tag: "Bé Mèo Dễ Thương",
    emoji: "🐈",
    badge: "Khoa Nhi & Chăm sóc Mèo con",
    desc: "Tầm soát bệnh lý hô hấp, nấm da và chăm sóc lông mượt mà"
  },
  {
    url: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=1920&auto=format&fit=crop",
    tag: "Chó & Mèo Đồng Hành",
    emoji: "🐾",
    badge: "Mái ấm 4 chân hạnh phúc",
    desc: "Bác sĩ chuyên khoa tận tâm, đồng hành cùng sức khỏe thú cưng trọn đời"
  },
  {
    url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1920&auto=format&fit=crop",
    tag: "Cún Cưng Hạnh Phúc",
    emoji: "🐶",
    badge: "Phục hồi & Nội trú 5 sao",
    desc: "Theo dõi 24/7, phòng lưu bệnh vô trùng tiêu chuẩn quốc tế"
  }
];

const stats = [
  { label: 'Khách hàng', value: '5K+' },
  { label: 'Ca khám', value: '12K+' },
  { label: 'Năm KN', value: '8+' },
  { label: 'Bác sĩ', value: '15' },
];

const services = [
  { icon: Stethoscope, title: 'Khám Tổng Quát', desc: 'Kiểm tra sức khỏe định kỳ, tiêm phòng và tư vấn dinh dưỡng chi tiết.', service: 'Khám Tổng Quát', color: 'text-brand-500 bg-brand-50' },
  { icon: Clock, title: 'Cấp Cứu 24/7', desc: 'Đội ngũ trực ban sẵn sàng tiếp nhận các ca bệnh khẩn cấp bất kể ngày đêm.', service: 'Cấp Cứu 24/7', color: 'text-red-500 bg-red-50' },
  { icon: ShieldCheck, title: 'Phẫu Thuật', desc: 'Trang thiết bị phòng mổ hiện đại, vô trùng. Đảm bảo an toàn tuyệt đối.', service: 'Phẫu Thuật Y Khoa', color: 'text-indigo-500 bg-indigo-50' },
  { icon: Scissors, title: 'Grooming & Spa', desc: 'Cắt tỉa lông chuyên nghiệp, chăm sóc sắc đẹp, cắt móng cho thú cưng.', service: 'Grooming & Spa', color: 'text-pink-500 bg-pink-50' },
  { icon: Activity, title: 'Xét Nghiệm & CT', desc: 'Chẩn đoán chính xác với máy X-quang, siêu âm và hệ thống xét nghiệm tiên tiến.', service: 'Xét Nghiệm - CT', color: 'text-gold-600 bg-gold-50' },
  { icon: Heart, title: 'Nội Khoa', desc: 'Điều trị bệnh lý nội khoa phức tạp với phác đồ khoa học, theo dõi sát sao.', service: 'Nội Khoa', color: 'text-brand-600 bg-brand-100' },
];

const petGallery = [
  {
    url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=800&auto=format&fit=crop",
    tag: "Cún Golden Retriever 🐕",
    desc: "Khỏe khoắn, vui tươi và tràn đầy năng lượng"
  },
  {
    url: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=800&auto=format&fit=crop",
    tag: "Mèo Anh Lông Ngắn 🐱",
    desc: "Khu khám riêng biệt, nhẹ nhàng và an tâm"
  },
  {
    url: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=800&auto=format&fit=crop",
    tag: "Mèo Con Đáng Yêu 🐾",
    desc: "Chăm sóc dịu dàng từ những ngày đầu đời"
  },
  {
    url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=800&auto=format&fit=crop",
    tag: "Mèo Mắt Xanh Quý Phái 🐈",
    desc: "Chế độ dinh dưỡng & spa lông mượt mà"
  }
];

const testimonials = [
  { name: 'Nguyễn Thị Lan', pet: 'Cún Golden', text: 'Đội ngũ bác sĩ rất tận tâm! Bé Max nhà tôi được chăm sóc tuyệt vời, từ khâu đặt lịch đến khi khám xong, mọi thứ đều mượt mà và chuyên nghiệp.', avatar: '🐕', rating: 5 },
  { name: 'Trần Văn Hùng', pet: 'Mèo Maine Coon', text: 'Dịch vụ vô cùng đẳng cấp, phòng khám sạch sẽ và hiện đại. Bác sĩ giải thích rất chi tiết tình trạng sức khỏe của bé.', avatar: '🐈', rating: 5 },
  { name: 'Lê Hoàng Yến', pet: 'Mèo Anh Lông Ngắn (Bé Bơ)', text: 'Bé mèo nhà mình rất nhát người lạ nhưng đến KT Pet Clinic lại cực kỳ ngoan. Bác sĩ thao tác nhẹ nhàng và có phòng riêng biệt cho mèo!', avatar: '🐱', rating: 5 },
];

const whyUs = [
  { title: 'Cơ sở vật chất chuẩn quốc tế', desc: 'Hệ thống trang thiết bị y tế nhập khẩu từ Đức & Mỹ. Môi trường vô trùng tuyệt đối.' },
  { title: 'Đội ngũ bác sĩ chuyên gia', desc: '15+ chuyên gia thú y được đào tạo chuyên sâu trong và ngoài nước, tận tâm với nghề.' },
  { title: 'Dịch vụ khám tại nhà', desc: 'Hỗ trợ thăm khám tận nơi cho các ca bệnh khó di chuyển, tiện lợi và an toàn.' },
  { title: 'Bảng giá minh bạch', desc: 'Mọi chi phí được thông báo rõ ràng trước khi điều trị, không phát sinh phụ phí.' },
];

export default function Home() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [petGalleryIdx, setPetGalleryIdx] = useState(0);
  const [staffs, setStaffs] = useState([]);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % heroSlides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setPetGalleryIdx(i => (i + 1) % petGallery.length), 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx(i => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    axios.get('/api/staffs').then(res => setStaffs(res.data.slice(0, 4))).catch(() => {});
  }, []);

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  };

  return (
    <div className="overflow-x-hidden bg-white dark:bg-[#0f1115]">
      {/* ====== HERO ====== */}
      <section className="relative h-[95vh] min-h-[680px] flex items-center overflow-hidden">
        {/* Background slideshow with cats and dogs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIdx}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <img
              src={heroSlides[heroIdx].url}
              alt={heroSlides[heroIdx].tag}
              className="w-full h-full object-cover will-change-transform"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlay - deeper contrast & smooth depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/70 to-transparent opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

        {/* Hero Navigation Arrows (Desktop) */}
        <div className="absolute inset-y-0 left-4 right-4 z-20 hidden md:flex items-center justify-between pointer-events-none">
          <button
            onClick={() => setHeroIdx(i => (i - 1 + heroSlides.length) % heroSlides.length)}
            className="pointer-events-auto p-3.5 rounded-full bg-black/30 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md border border-white/15 transition-all duration-300 hover:scale-110 shadow-xl"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setHeroIdx(i => (i + 1) % heroSlides.length)}
            className="pointer-events-auto p-3.5 rounded-full bg-black/30 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md border border-white/15 transition-all duration-300 hover:scale-110 shadow-xl"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full pt-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={heroIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-brand-200 text-xs font-bold tracking-[0.15em] uppercase rounded-full border border-white/15 mb-6 backdrop-blur-md shadow-lg"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-300" />
                <span>{heroSlides[heroIdx].badge}</span>
                <span className="text-sm">{heroSlides[heroIdx].emoji}</span>
              </motion.div>
            </AnimatePresence>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Sức khoẻ<br />
              <span className="text-brand-400">thú cưng</span><br />
              của bạn
            </h1>

            <AnimatePresence mode="wait">
              <motion.p
                key={heroIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8 max-w-lg font-light"
              >
                {heroSlides[heroIdx].desc}
              </motion.p>
            </AnimatePresence>

            {/* Pet Quick Switcher Tabs in Hero */}
            <div className="flex flex-wrap gap-2 mb-8">
              {heroSlides.map((slide, i) => (
                <button
                  key={slide.tag}
                  onClick={() => setHeroIdx(i)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 border backdrop-blur-sm ${
                    i === heroIdx
                      ? 'bg-brand-500 text-white border-brand-400 shadow-glow-brand scale-105'
                      : 'bg-black/30 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{slide.emoji}</span>
                  <span>{slide.tag}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to="/booking" className="btn-primary py-4 px-8 text-base shadow-glow-brand">
                <CalendarCheck className="w-5 h-5" />
                Đặt lịch khám ngay
              </Link>
              <a href="tel:0901234567" className="btn-ghost text-white hover:text-slate-900 hover:bg-white py-4 px-8 text-base bg-white/10 border border-white/15 backdrop-blur-md">
                <Phone className="w-5 h-5" />
                Hotline 24/7
              </a>
            </div>
          </motion.div>
        </div>

        {/* Stats bar - Floating elegant block */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="absolute bottom-8 left-6 right-6 md:left-12 md:right-auto z-10"
        >
          <div className="flex items-center gap-6 md:gap-14 py-5 px-8 bg-slate-950/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
            {stats.map(({ label, value }) => (
              <div key={label} className="flex flex-col">
                <span className="text-2xl md:text-3xl font-black text-white mb-0.5 tracking-tight">{value}</span>
                <span className="text-[11px] text-brand-300 font-semibold uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Slide indicators (Right side) */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-3 z-10">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`w-1.5 rounded-full transition-all duration-500 ${i === heroIdx ? 'h-12 bg-brand-400 shadow-glow-brand' : 'h-4 bg-white/20 hover:bg-white/50'}`}
              aria-label={`Chuyển đến slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ====== SERVICES - Elegant Grid ====== */}
      <section className="py-24 lg:py-32 bg-slate-50 dark:bg-[#0f1115]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div {...fadeUp} className="max-w-3xl mb-16 lg:mb-24">
            <span className="section-label">Chuyên khoa</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Dịch vụ y tế <br className="hidden md:block" />
              <span className="text-brand-600 dark:text-brand-400">chuyên sâu & toàn diện</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((svc, idx) => {
              const Icon = svc.icon;
              return (
                <motion.div
                  key={svc.title}
                  {...fadeUp}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="group bg-white dark:bg-[#1a1d24] p-8 rounded-3xl border border-slate-200/60 dark:border-white/5 hover:border-brand-200 dark:hover:border-brand-900/50 transition-all duration-300 hover:shadow-float relative overflow-hidden will-change-transform"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${svc.color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-3">{svc.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">{svc.desc}</p>

                  <Link
                    to={`/booking?service=${encodeURIComponent(svc.service)}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors uppercase tracking-wide"
                  >
                    Đặt lịch <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====== WHY US - Editorial Layout with Cats & Dogs Slider ====== */}
      <section className="py-24 lg:py-32 bg-white dark:bg-[#0a0c0f]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center">
            
            {/* Image Block - 5 cols with smooth Cats & Dogs Carousel */}
            <motion.div
              {...fadeUp}
              className="lg:col-span-5 relative"
            >
              <div className="aspect-[3/4] rounded-3xl overflow-hidden relative shadow-2xl group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={petGalleryIdx}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <img
                      src={petGallery[petGalleryIdx].url}
                      alt={petGallery[petGalleryIdx].tag}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/30" />

                    {/* Floating Pill Tag at Top Left */}
                    <div className="absolute top-5 left-5 backdrop-blur-md bg-black/50 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/20 flex items-center gap-2 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{petGallery[petGalleryIdx].tag}</span>
                    </div>

                    {/* Subtitle at Bottom */}
                    <div className="absolute bottom-6 left-6 right-6 text-white pr-20">
                      <p className="text-[11px] text-brand-300 font-semibold uppercase tracking-wider mb-1">KT Pet Care</p>
                      <p className="text-sm font-medium text-slate-100 leading-snug drop-shadow-md">
                        {petGallery[petGalleryIdx].desc}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Card Slider Controls */}
                <div className="absolute top-5 right-5 z-10 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setPetGalleryIdx(i => (i - 1 + petGallery.length) % petGallery.length);
                    }}
                    className="p-2 rounded-full bg-black/40 hover:bg-white/30 text-white backdrop-blur-md border border-white/15 transition-transform active:scale-95 shadow-md"
                    aria-label="Previous pet"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setPetGalleryIdx(i => (i + 1) % petGallery.length);
                    }}
                    className="p-2 rounded-full bg-black/40 hover:bg-white/30 text-white backdrop-blur-md border border-white/15 transition-transform active:scale-95 shadow-md"
                    aria-label="Next pet"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Dots Indicator */}
                <div className="absolute bottom-4 right-5 z-10 flex gap-1.5">
                  {petGallery.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPetGalleryIdx(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === petGalleryIdx ? 'w-6 bg-brand-400 shadow-glow-brand' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
                      aria-label={`Ảnh thú cưng ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Floating Award Badge */}
              <div className="absolute -bottom-8 -right-8 bg-white dark:bg-[#1a1d24] p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-white/5 max-w-[240px] z-20">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />
                  ))}
                </div>
                <p className="font-bold text-slate-900 dark:text-white leading-snug">Top 1 phòng khám được yêu thích nhất TP.HCM</p>
              </div>
            </motion.div>

            {/* Text Block - 7 cols */}
            <motion.div {...fadeUp} className="lg:col-span-7 pt-12 lg:pt-0">
              <span className="section-label">Triết lý hoạt động</span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-12">
                Không chỉ là y tế, <br />
                đó là <span className="text-brand-600 dark:text-brand-400">tình yêu thương</span>
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-10">
                {whyUs.map(({ title, desc }, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute top-1.5 left-0 w-1.5 h-1.5 rounded-full bg-brand-500" />
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ====== TEAM ====== */}
      {staffs.length > 0 && (
        <section className="py-24 lg:py-32 bg-slate-50 dark:bg-[#0f1115]">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <motion.div {...fadeUp} className="max-w-xl">
                <span className="section-label">Chuyên gia</span>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Đội ngũ y bác sĩ
                </h2>
              </motion.div>
              <motion.div {...fadeUp}>
                <Link to="/about" className="text-brand-600 dark:text-brand-400 font-bold hover:text-brand-700 flex items-center gap-2">
                  Xem toàn bộ <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {staffs.map((s, idx) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="group relative rounded-3xl overflow-hidden aspect-[3/4] bg-slate-200 dark:bg-slate-800"
                >
                  {s.image ? (
                    <img src={s.image} alt={s.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0 will-change-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                      <PawPrint className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-bold text-white text-xl mb-1">{s.name}</h3>
                    <p className="text-brand-300 text-sm font-medium">
                      {s.role === 'Veterinarian' ? 'Bác sĩ Thú y' :
                       s.role === 'Groomer' ? 'Chuyên gia Grooming' :
                       s.role === 'Nurse' ? 'Điều dưỡng' : s.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== TESTIMONIALS ====== */}
      <section className="py-24 lg:py-32 bg-brand-900 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-800/50 skew-x-12 translate-x-32" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 text-center">
          <motion.div {...fadeUp} className="mb-16">
            <span className="section-label !text-brand-300">Khách hàng</span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Sự tin tưởng tuyệt đối
            </h2>
          </motion.div>

          <div className="relative min-h-[250px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex flex-col items-center justify-center will-change-transform"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonials[testimonialIdx].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <blockquote className="text-xl md:text-2xl lg:text-3xl font-medium text-white leading-relaxed mb-8 max-w-3xl">
                  "{testimonials[testimonialIdx].text}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl border border-white/20 shadow-xl">
                    {testimonials[testimonialIdx].avatar}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white">{testimonials[testimonialIdx].name}</p>
                    <p className="text-sm text-brand-200">Chủ nhân của {testimonials[testimonialIdx].pet}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="py-24 lg:py-32 bg-white dark:bg-[#0a0c0f]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-glow-brand">
              <PawPrint className="w-10 h-10 text-brand-600 dark:text-brand-400" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
              Đồng hành cùng<br />
              <span className="text-brand-600 dark:text-brand-400">sức khoẻ thú cưng</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light">
              Đặt lịch khám ngay hôm nay để nhận được sự chăm sóc tận tâm nhất từ đội ngũ chuyên gia của chúng tôi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking" className="btn-primary py-4 px-10 text-lg shadow-glow-brand">
                <CalendarCheck className="w-5 h-5" />
                Đặt lịch khám ngay
              </Link>
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="btn-secondary py-4 px-10 text-lg">
                <MapPin className="w-5 h-5" />
                Tìm phòng khám
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
