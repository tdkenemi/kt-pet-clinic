import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Star, Quote, MessageCircle, ChevronLeft, ChevronRight, ThumbsUp, Reply } from 'lucide-react';
import { Link } from 'react-router-dom';

const StarRating = ({ rating, size = 'sm' }) => {
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`${sz} ${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'}`}
        />
      ))}
    </div>
  );
};

const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-4">{star}</span>
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="h-full bg-amber-400 rounded-full"
        />
      </div>
      <span className="text-xs text-slate-500 w-6 text-right">{count}</span>
    </div>
  );
};

export default function Reviews() {
  const [data, setData] = useState({ reviews: [], total: 0, pages: 1, avgRating: 0, totalCount: 0, ratingDist: [] });
  const [page, setPage] = useState(1);
  const [filterRating, setFilterRating] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [page, filterRating]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (filterRating) params.rating = filterRating;
      const res = await axios.get('/api/reviews', { params });
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0f1115] min-h-screen pt-20 transition-colors">

      {/* ── Hero ── */}
      <section className="bg-slate-900 dark:bg-[#0a0c0f] text-white py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <p className="text-brand-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Đánh giá khách hàng</p>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">Họ tin tưởng chúng tôi</h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Hơn {data.totalCount > 0 ? data.totalCount.toLocaleString() : '5,000+'} gia đình đã gửi gắm thú cưng tại KT Pet Clinic.
            </p>
          </motion.div>

          {/* Stats + Rating Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
          >
            {/* Big average score */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 flex items-center gap-6">
              <div>
                <div className="text-6xl font-black text-white leading-none">{data.avgRating || '—'}</div>
                <div className="mt-2"><StarRating rating={Math.round(data.avgRating)} size="lg" /></div>
                <div className="text-slate-400 text-sm mt-2">{data.totalCount} lượt đánh giá</div>
              </div>
            </div>

            {/* Bar chart */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 flex flex-col justify-center gap-2.5">
              {data.ratingDist.map(({ star, count }) => (
                <RatingBar key={star} star={star} count={count} total={data.totalCount} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Filter bar ── */}
      <section className="bg-slate-50 dark:bg-[#0f1115] border-b border-slate-200 dark:border-white/5 py-4 px-6 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 shrink-0">Lọc theo:</span>
          {['', '5', '4', '3', '2', '1'].map(r => (
            <button
              key={r}
              onClick={() => { setFilterRating(r); setPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                filterRating === r
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10'
              }`}
            >
              {r === '' ? 'Tất cả' : (
                <><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {r} sao</>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── Reviews Grid ── */}
      <section className="py-16 px-6 md:px-12 lg:px-24 bg-slate-50 dark:bg-[#0f1115]">
        <div className="max-w-7xl mx-auto">

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white dark:bg-[#1a1d24] rounded-3xl p-7 h-52 animate-pulse" />
              ))}
            </div>
          ) : data.reviews.length === 0 ? (
            <div className="text-center py-24">
              <Star className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Chưa có đánh giá nào{filterRating ? ` ${filterRating} sao` : ''}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.reviews.map((review, idx) => {
                const petName = review.appointmentId?.petId?.name;
                const petSpecies = review.appointmentId?.petId?.species;
                const initials = review.userId?.fullName?.split(' ').map(w => w[0]).slice(-2).join('') || 'U';
                return (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.06 }}
                    className="bg-white dark:bg-[#1a1d24] rounded-3xl p-7 shadow-sm border border-slate-200/60 dark:border-white/5 hover:shadow-lg hover:-translate-y-0.5 transition-all relative group flex flex-col"
                  >
                    <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-100 dark:text-white/5" />

                    {/* Stars */}
                    <div className="mb-3"><StarRating rating={review.rating} /></div>

                    {/* Comment */}
                    <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed text-sm flex-1">
                      "{review.comment || 'Dịch vụ rất tốt!'}"
                    </p>

                    {/* Images (nếu có) */}
                    {review.images?.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        {review.images.slice(0, 3).map((img, i) => (
                          <img key={i} src={img} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-white/10" />
                        ))}
                      </div>
                    )}

                    {/* User info */}
                    <div className="border-t border-slate-100 dark:border-white/10 pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {review.userId?.avatar ? (
                          <img src={review.userId.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                            {initials}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{review.userId?.fullName || 'Khách hàng'}</p>
                          {petName && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">Phụ huynh của {petName} ({petSpecies})</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    {/* Admin reply */}
                    {review.adminReply && (
                      <div className="mt-3 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl border border-brand-100 dark:border-brand-900/30">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 mb-1">
                          <Reply className="w-3.5 h-3.5" /> Phản hồi từ KT Pet Clinic
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{review.adminReply}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition ${
                    p === page
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >{p}</button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center bg-gradient-to-br from-brand-600 to-brand-700 rounded-3xl p-12 text-white"
          >
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-brand-200" />
            <h2 className="text-3xl font-black mb-3">Bạn đã từng đến KT Pet Clinic?</h2>
            <p className="text-brand-100 mb-8 text-lg">Chia sẻ trải nghiệm sau khi hoàn thành lịch khám để giúp các gia đình khác.</p>
            <Link
              to="/my-appointments"
              className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-all shadow-lg"
            >
              <Star className="w-4 h-4 fill-brand-600 text-brand-600" />
              Đánh giá lịch khám của bạn
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
