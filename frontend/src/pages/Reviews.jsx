import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const reviews = [
  { id: 1, name: 'Nguyễn Thị Trân', pet: 'Milo (Corgi)', rating: 5, text: 'Dịch vụ vô cùng chuyên nghiệp. Bác sĩ tư vấn rất nhiệt tình, giải đáp mọi thắc mắc của mình.', date: '10/05/2026', avatar: 'T' },
  { id: 2, name: 'Lê Thị Hoa', pet: 'Luna (Mèo Anh)', rating: 5, text: 'Phòng khám sạch sẽ, không có mùi hôi. Bé nhà mình đi cắt tỉa lông về xinh xắn hẳn ra! Nhân viên thân thiện và tận tâm.', date: '12/05/2026', avatar: 'H' },
  { id: 3, name: 'Phạm Văn Hùng', pet: 'Kiki (Poodle)', rating: 5, text: 'Cấp cứu 24/7 rất nhanh chóng, bác sĩ đã cứu bé nhà mình trong đêm. Vô cùng biết ơn. Sẽ giới thiệu cho tất cả bạn bè!', date: '15/05/2026', avatar: 'H' },
  { id: 4, name: 'Trần Quỳnh My', pet: 'Bella (Ba Tư)', rating: 5, text: 'Giá cả minh bạch, dịch vụ tốt. Mình có thể theo dõi hồ sơ bệnh án online rất tiện lợi. Rất hài lòng!', date: '18/05/2026', avatar: 'M' },
  { id: 5, name: 'Hoàng Minh Quân', pet: 'Max (Golden)', rating: 5, text: 'Trang thiết bị rất hiện đại, mình hoàn toàn yên tâm khi gửi gắm Max ở đây. Bác sĩ chuyên nghiệp, tận tâm.', date: '20/05/2026', avatar: 'Q' },
  { id: 6, name: 'Đặng Như Thảo', pet: 'Coco (Pug)', rating: 5, text: 'Các bạn nhân viên thân thiện, chăm sóc các bé như con ruột vậy. 10 điểm không có nhưng! Quá tuyệt vời.', date: '25/05/2026', avatar: 'T' },
];

const stats = [
  { value: '4.9/5', label: 'Điểm đánh giá trung bình', emoji: '⭐' },
  { value: '5,000+', label: 'Khách hàng hài lòng', emoji: '😊' },
  { value: '98%', label: 'Sẽ giới thiệu cho bạn bè', emoji: '💬' },
];

export default function Reviews() {
  return (
    <div className="bg-white dark:bg-[#15171c] min-h-screen pt-20 transition-colors">
      {/* Hero */}
      <section className="bg-slate-900 dark:bg-[#15171c] text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-4">Đánh giá khách hàng</p>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Họ tin tưởng chúng tôi
            </h1>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
              Hơn 5,000 gia đình đã gửi gắm thú cưng tại KT Pet Clinic và luôn quay lại.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-6 mt-16"
          >
            {stats.map(s => (
              <div key={s.label} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="text-2xl mb-2">{s.emoji}</div>
                <div className="text-3xl font-bold">{s.value}</div>
                <div className="text-slate-400 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-slate-50 dark:bg-[#15171c]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.09 }}
                className="bg-white dark:bg-[#1e2028] rounded-3xl p-7 shadow-sm border border-slate-200/60 dark:border-white/5 hover:shadow-lg hover:-translate-y-0.5 transition-all relative group"
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-100 dark:text-white/5 transition-colors" />

                {/* Stars */}
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className="w-4.5 h-4.5 fill-amber-400 text-amber-400 mr-0.5" />
                  ))}
                </div>

                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed text-sm">
                  "{review.text}"
                </p>

                <div className="border-t border-slate-100 dark:border-white/10 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                      {review.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{review.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Phụ huynh của {review.pet}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{review.date}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center bg-blue-600 rounded-3xl p-12 text-white"
          >
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-blue-200" />
            <h2 className="text-3xl font-bold mb-4">Bạn đã từng đến KT Pet Clinic?</h2>
            <p className="text-blue-100 mb-8">Chia sẻ trải nghiệm của bạn để giúp các gia đình khác.</p>
            <Link to="/booking" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-all shadow-lg">
              Đặt lịch & Trải nghiệm ngay
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
