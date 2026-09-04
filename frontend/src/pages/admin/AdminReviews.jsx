import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Star, Eye, EyeOff, Trash2, Reply, X, MessageSquare, TrendingUp } from 'lucide-react';
import { useAlert } from '../../contexts/AlertContext';

const getUser = () => {
  try { return JSON.parse(sessionStorage.getItem('user') || 'null'); }
  catch { return null; }
};

const StarDisplay = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} className={`w-4 h-4 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'}`} />
    ))}
  </div>
);

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState(null); // review object
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [filterRating, setFilterRating] = useState('');
  const { showAlert, showConfirm } = useAlert();
  const user = getUser();

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/reviews/admin/all', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setReviews(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const togglePublic = async (id) => {
    try {
      await axios.patch(`/api/reviews/${id}/toggle-public`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setReviews(prev => prev.map(r => r._id === id ? { ...r, isPublic: !r.isPublic } : r));
    } catch { showAlert('Lỗi', 'Không thể thay đổi trạng thái', 'error'); }
  };

  const deleteReview = (id) => {
    showConfirm('Xóa đánh giá', 'Hành động này không thể hoàn tác.', async () => {
      try {
        await axios.delete(`/api/reviews/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
        setReviews(prev => prev.filter(r => r._id !== id));
        showAlert('Thành công', 'Đã xóa đánh giá', 'success');
      } catch { showAlert('Lỗi', 'Không thể xóa', 'error'); }
    });
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    try {
      const res = await axios.put(`/api/reviews/${replyModal._id}/reply`, { adminReply: replyText }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setReviews(prev => prev.map(r => r._id === replyModal._id ? { ...r, adminReply: replyText, repliedAt: new Date() } : r));
      setReplyModal(null);
      setReplyText('');
      showAlert('Thành công', 'Đã gửi phản hồi', 'success');
    } catch { showAlert('Lỗi', 'Không thể gửi phản hồi', 'error'); }
    finally { setReplySubmitting(false); }
  };

  // Stats
  const totalCount = reviews.length;
  const avgRating = totalCount > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / totalCount).toFixed(1) : 0;
  const publicCount = reviews.filter(r => r.isPublic).length;

  const filtered = reviews.filter(r => filterRating === '' || r.rating === parseInt(filterRating));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý Đánh giá</h1>
          <p className="text-slate-500 text-sm mt-1">Phản hồi từ khách hàng sau khi khám</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Tổng đánh giá', value: totalCount, icon: MessageSquare, color: 'text-blue-600 bg-blue-50' },
          { label: 'Điểm TB', value: `${avgRating} ⭐`, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
          { label: 'Đang hiển thị', value: publicCount, icon: Eye, color: 'text-brand-600 bg-brand-50' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/5 p-4">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {['', '5', '4', '3', '2', '1'].map(r => (
          <button
            key={r}
            onClick={() => setFilterRating(r)}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              filterRating === r
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50'
            }`}
          >
            {r === '' ? 'Tất cả' : <><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {r} sao</>}
          </button>
        ))}
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-white dark:bg-slate-800 rounded-2xl animate-pulse border border-slate-200 dark:border-white/5" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/5">
          <Star className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">Chưa có đánh giá nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review, idx) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 transition ${
                review.isPublic
                  ? 'border-slate-200 dark:border-white/5'
                  : 'border-slate-200/50 dark:border-white/5 opacity-60'
              }`}
            >
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="shrink-0">
                  {review.userId?.avatar ? (
                    <img src={review.userId.avatar} alt="" className="w-11 h-11 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                      {review.userId?.fullName?.[0] || 'U'}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{review.userId?.fullName || 'Khách hàng'}</span>
                      <span className="text-slate-400 text-xs ml-2">{review.userId?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarDisplay rating={review.rating} />
                      <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                      {review.isPublic
                        ? <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded font-medium">Hiển thị</span>
                        : <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-medium">Đã ẩn</span>
                      }
                    </div>
                  </div>

                  {review.appointmentId?.petId && (
                    <p className="text-xs text-slate-500 mb-1.5">
                      🐾 {review.appointmentId.petId.name} ({review.appointmentId.petId.species})
                      {' '}·{' '}{review.appointmentId.services?.map(s => s.name).join(', ')}
                    </p>
                  )}

                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    "{review.comment || 'Không có nhận xét'}"
                  </p>

                  {/* Review images */}
                  {review.images?.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {review.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-white/10" />
                      ))}
                    </div>
                  )}

                  {/* Admin reply */}
                  {review.adminReply && (
                    <div className="mt-3 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-900/30">
                      <p className="text-xs font-bold text-brand-600 dark:text-brand-400 mb-1">↩ Phản hồi của phòng khám</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{review.adminReply}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => { setReplyModal(review); setReplyText(review.adminReply || ''); }}
                    title="Phản hồi"
                    className="p-2 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition"
                  >
                    <Reply className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => togglePublic(review._id)}
                    title={review.isPublic ? 'Ẩn đánh giá' : 'Hiện đánh giá'}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    {review.isPublic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteReview(review._id)}
                    title="Xóa"
                    className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Phản hồi đánh giá</h3>
              <button onClick={() => { setReplyModal(null); setReplyText(''); }} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original review */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <StarDisplay rating={replyModal.rating} />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{replyModal.userId?.fullName}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">"{replyModal.comment}"</p>
            </div>

            <form onSubmit={submitReply} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nội dung phản hồi</label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Cảm ơn quý khách đã tin tưởng KT Pet Clinic..."
                  className="input-field resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setReplyModal(null); setReplyText(''); }} className="btn-secondary flex-1 py-3">Hủy</button>
                <button type="submit" disabled={replySubmitting} className="btn-primary flex-1 py-3">
                  {replySubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
