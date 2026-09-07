import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Calendar, User, Clock, ArrowRight, ArrowUpRight, Search,
  Plus, X, Edit2, Trash2, Heart, MessageCircle, Send,
  Image as ImageIcon, ChevronDown, ChevronUp, Share2,
  Sparkles, Phone, ShieldCheck, Stethoscope, Tag, CheckCircle2,
  ExternalLink, ThumbsUp, AlertCircle
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAlert } from '../contexts/AlertContext';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop";

const CATEGORIES = [
  { id: 'all', name: 'Tất cả 🐾', tag: '' },
  { id: 'cat', name: 'Mèo cưng 🐱', tag: 'Mèo cưng' },
  { id: 'dog', name: 'Cún cưng 🐶', tag: 'Cún cưng' },
  { id: 'nutrition', name: 'Dinh dưỡng 🥗', tag: 'Dinh dưỡng' },
  { id: 'medical', name: 'Y tế thú y 🩺', tag: 'Y tế thú y' },
  { id: 'training', name: 'Huấn luyện 🎾', tag: 'Huấn luyện' },
  { id: 'experience', name: 'Kinh nghiệm 💡', tag: 'Kinh nghiệm' },
];

const TRENDING_TAGS = [
  'Mèo cưng', 'Cún cưng', 'Tiêm phòng', 'Dinh dưỡng', 'Cấp cứu', 'Huấn luyện', 'Mèo con'
];

function readingTime(content) {
  const words = (content || '').split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 180));
  return `${mins} phút đọc`;
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Vừa xong';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

const getUser = () => {
  try { return JSON.parse(sessionStorage.getItem('user') || 'null'); }
  catch { return null; }
};

// ==========================================
// MODAL FORM: ĐĂNG / SỬA BÀI VIẾT
// ==========================================
function BlogFormModal({ initial, onSave, onClose }) {
  const [formData, setFormData] = useState(
    initial || {
      title: '',
      content: '',
      image: '',
      images: [],
      tags: ['Mèo cưng'],
    }
  );
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewImages, setPreviewImages] = useState(initial?.images || []);
  const fileInputRef = useRef();
  const { showAlert } = useAlert();

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        showAlert('Cảnh báo', 'Kích thước ảnh tối đa 5MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, reader.result]);
        setFormData(prev => ({ ...prev, images: [...(prev.images || []), reader.result] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== idx));
    setFormData(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== idx) }));
  };

  const addTag = (tagToAdd) => {
    const cleaned = tagToAdd.trim().replace(/^#/, '');
    if (!cleaned) return;
    if ((formData.tags || []).includes(cleaned)) return;
    setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), cleaned] }));
    setTagInput('');
  };

  const removeTag = (tToRemove) => {
    setFormData(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tToRemove) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showAlert('Thông báo', 'Vui lòng điền đầy đủ tiêu đề và nội dung', 'warning');
      return;
    }
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl my-8 bg-slate-100 dark:bg-white/5 p-2 ring-1 ring-slate-200/80 dark:ring-white/10 rounded-[2.5rem] shadow-2xl"
      >
        <div className="bg-white dark:bg-[#15181e] rounded-[calc(2.5rem-0.5rem)] p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {initial?._id ? 'Chỉnh sửa bài viết' : 'Đăng bài viết mới'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Chia sẻ câu chuyện hoặc mẹo chăm sóc thú cưng cùng cộng đồng
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            {/* Tiêu đề */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                Tiêu đề bài viết <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Bí quyết giúp mèo con thích nghi với nhà mới..."
                value={formData.title}
                required
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="input-field text-base font-semibold"
              />
            </div>

            {/* Chủ đề / Thẻ Tags */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                Chủ đề & Thẻ phân loại
              </label>
              <div className="flex flex-wrap gap-2 mb-2.5">
                {['Mèo cưng', 'Cún cưng', 'Dinh dưỡng', 'Y tế thú y', 'Huấn luyện', 'Kinh nghiệm'].map(tag => {
                  const isSelected = (formData.tags || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => isSelected ? removeTag(tag) : addTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {tag} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Thêm thẻ tùy chỉnh (nhấn Enter hoặc Thêm)..."
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                  className="input-field py-2 text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={() => addTag(tagInput)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
                >
                  Thêm
                </button>
              </div>
              {(formData.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.tags.map((t, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-semibold">
                      #{t}
                      <button type="button" onClick={() => removeTag(t)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Nội dung bài viết */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Nội dung chi tiết <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400">{formData.content.length} ký tự</span>
              </div>
              <textarea
                placeholder="Chia sẻ trải nghiệm, hướng dẫn, câu chuyện thú cưng của bạn thật chi tiết..."
                value={formData.content}
                required
                rows={7}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                className="input-field resize-none leading-relaxed"
              />
            </div>

            {/* Ảnh bìa URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                Ảnh bìa chính (URL hình ảnh)
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/... (tùy chọn hoặc dán link ảnh)"
                value={formData.image || ''}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                className="input-field text-xs"
              />
              {formData.image && (
                <div className="mt-3 relative rounded-2xl overflow-hidden h-36 bg-slate-100 border border-slate-200 dark:border-slate-800">
                  <img
                    src={formData.image}
                    alt="Preview bìa"
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-full">
                    Xem trước ảnh bìa
                  </span>
                </div>
              )}
            </div>

            {/* Upload ảnh từ thiết bị */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                Bộ sưu tập ảnh (Tải từ thiết bị)
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-brand-600 transition group bg-slate-50/50 dark:bg-slate-900/30"
              >
                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center group-hover:scale-110 transition">
                  <ImageIcon className="w-5 h-5 text-brand-500" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Nhấn để chọn ảnh</span>
                  <span className="text-xs text-slate-400 block mt-0.5">Hỗ trợ JPG, PNG, WEBP tối đa 5MB</span>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />

              {previewImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2.5 mt-3">
                  {previewImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden h-20 bg-slate-100">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md opacity-90 hover:opacity-100 hover:scale-110 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 py-3 text-sm font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2"
              >
                {saving ? (
                  <span>Đang xử lý...</span>
                ) : (
                  <>
                    <span>{initial?._id ? 'Cập nhật bài viết' : 'Đăng bài viết ngay'}</span>
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// COMPONENT: BÌNH LUẬN
// ==========================================
function CommentSection({ blog, user, onUpdate }) {
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { showAlert, showConfirm } = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSending(true);
    try {
      const res = await axios.post(`/api/blogs/${blog._id}/comments`, { content: comment.trim() }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      onUpdate(res.data);
      setComment('');
    } catch (err) {
      showAlert('Lỗi', err.response?.data?.message || 'Lỗi gửi bình luận', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    showConfirm('Xác nhận', 'Bạn có chắc muốn xóa bình luận này?', async () => {
      try {
        const res = await axios.delete(`/api/blogs/${blog._id}/comments/${commentId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        onUpdate(res.data);
      } catch (err) {
        showAlert('Lỗi', 'Không thể xóa bình luận', 'error');
      }
    });
  };

  const comments = blog.comments || [];
  const displayComments = showAll ? comments : comments.slice(-3);

  return (
    <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-brand-500" />
          Bình luận & Thảo luận ({comments.length})
        </h4>
        {comments.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold flex items-center gap-1"
          >
            {showAll ? 'Thu gọn' : `Xem tất cả ${comments.length} thảo luận`}
          </button>
        )}
      </div>

      {/* Form viết bình luận */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
            {(user.fullName || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Viết cảm nghĩ hoặc chia sẻ của bạn..."
              className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
            <button
              type="submit"
              disabled={sending || !comment.trim()}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-4 p-3 rounded-2xl bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/20 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Vui lòng đăng nhập để tham gia thảo luận cùng hội yêu thú cưng KT Clinic.
          </p>
        </div>
      )}

      {/* Danh sách bình luận */}
      <div className="space-y-2.5">
        {displayComments.map(c => {
          const authorName = c.userId?.fullName || 'Người dùng ẩn danh';
          const isCommentOwner = user && (user._id === c.userId?._id || user._id === c.userId || user.role === 'admin');

          return (
            <div key={c._id} className="flex gap-2.5 group items-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm mt-0.5">
                {authorName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 rounded-2xl px-3.5 py-2 text-xs border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{authorName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{timeAgo(c.createdAt)}</span>
                    {isCommentOwner && (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-0.5"
                        title="Xóa bình luận"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{c.content}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT: CARD TIÊU ĐIỂM (SPOTLIGHT HERO)
// ==========================================
function FeaturedBlogCard({ blog, user, onUpdate, onEdit, onDelete, onViewDetail }) {
  const [liked, setLiked] = useState(user ? (blog.likes || []).includes(user._id) : false);
  const [likeCount, setLikeCount] = useState((blog.likes || []).length);
  const isOwner = user && blog.authorId && (blog.authorId._id === user._id || blog.authorId === user._id);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const res = await axios.post(`/api/blogs/${blog._id}/like`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setLiked(res.data.liked);
      setLikeCount(res.data.likes);
    } catch {}
  };

  const coverImg = blog.image || (blog.images && blog.images.length > 0 ? blog.images[0] : DEFAULT_IMAGE);
  const primaryTag = (blog.tags && blog.tags[0]) || 'Kiến thức y khoa';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="p-2 bg-gradient-to-br from-brand-100/60 via-slate-100/80 to-brand-50/40 dark:from-slate-800/80 dark:via-slate-900/90 dark:to-brand-950/40 ring-1 ring-brand-300/40 dark:ring-white/10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 mb-10 group"
    >
      <div className="bg-white dark:bg-[#15181e] rounded-[calc(2.5rem-0.5rem)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 border border-slate-100 dark:border-slate-800">
        {/* Cột ảnh bên trái */}
        <div
          onClick={() => onViewDetail(blog)}
          className="lg:col-span-7 relative h-72 sm:h-80 lg:h-[380px] overflow-hidden cursor-pointer bg-slate-900"
        >
          <img
            src={coverImg}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={e => { e.target.src = DEFAULT_IMAGE; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badge tiêu điểm */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-600/95 text-white text-xs font-bold tracking-wide backdrop-blur-md shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              TIÊU ĐIỂM CỘNG ĐỒNG
            </span>
            <span className="px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 text-xs font-semibold backdrop-blur-md shadow-sm">
              {primaryTag}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/90 text-xs">
            <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5 text-brand-300" />
              {readingTime(blog.content)}
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-brand-300" />
              {timeAgo(blog.createdAt)}
            </span>
          </div>
        </div>

        {/* Cột nội dung bên phải */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Tác giả & Quyền chỉnh sửa */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {(blog.authorId?.fullName || blog.author || 'K').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {blog.authorId?.fullName || blog.author || 'Bác sĩ KT Clinic'}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-brand-500" />
                  </div>
                  <span className="text-[11px] text-slate-400">Thành viên KT Clinic</span>
                </div>
              </div>

              {(isOwner || user?.role === 'admin') && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(blog)}
                    className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 rounded-xl transition"
                    title="Sửa bài"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(blog._id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition"
                    title="Xóa bài"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Tiêu đề lớn */}
            <h2
              onClick={() => onViewDetail(blog)}
              className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors leading-tight mb-3 cursor-pointer line-clamp-3"
            >
              {blog.title}
            </h2>

            {/* Đoạn trích nội dung */}
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4 mb-4">
              {blog.content}
            </p>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {blog.tags.slice(0, 3).map((t, idx) => (
                  <span key={idx} className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dưới cùng: nút tương tác & CTA đọc bài */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm font-semibold transition ${
                  liked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
                <span>{likeCount}</span>
              </button>
              <button
                onClick={() => onViewDetail(blog)}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-brand-500 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{(blog.comments || []).length}</span>
              </button>
            </div>

            <button
              onClick={() => onViewDetail(blog)}
              className="group/btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm"
            >
              <span>Đọc toàn bộ</span>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// COMPONENT: CARD BÀI VIẾT TIÊU CHUẨN (BENTO)
// ==========================================
function BlogCard({ blog, user, onUpdate, onDelete, onEdit, onViewDetail }) {
  const [liked, setLiked] = useState(user ? (blog.likes || []).includes(user._id) : false);
  const [likeCount, setLikeCount] = useState((blog.likes || []).length);
  const [isExpanded, setIsExpanded] = useState(false);
  const isOwner = user && blog.authorId && (blog.authorId._id === user._id || blog.authorId === user._id);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const res = await axios.post(`/api/blogs/${blog._id}/like`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setLiked(res.data.liked);
      setLikeCount(res.data.likes);
    } catch {}
  };

  const coverImg = blog.image || (blog.images && blog.images.length > 0 ? blog.images[0] : DEFAULT_IMAGE);
  const displayImages = blog.image ? (blog.images || []) : (blog.images ? blog.images.slice(1) : []);
  const primaryTag = (blog.tags && blog.tags[0]) || 'Chăm sóc thú cưng';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="p-2 bg-slate-100/70 dark:bg-white/5 ring-1 ring-slate-200/80 dark:ring-white/10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
    >
      <div className="bg-white dark:bg-[#15181e] rounded-[calc(2rem-0.5rem)] overflow-hidden flex flex-col h-full border border-slate-100 dark:border-slate-800/80">
        {/* Khối Ảnh bìa: aspect-[16/10] chuẩn tạp chí */}
        <div
          onClick={() => onViewDetail(blog)}
          className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
        >
          <img
            src={coverImg}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={e => { e.target.src = DEFAULT_IMAGE; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          {/* Tag & Reading Time */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 text-[11px] font-bold backdrop-blur-md shadow-sm">
              {primaryTag}
            </span>
          </div>
          <div className="absolute bottom-3 right-3">
            <span className="px-2.5 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium backdrop-blur-md">
              {readingTime(blog.content)}
            </span>
          </div>
        </div>

        {/* Nội dung Card */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Tác giả & Ngày */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                  {(blog.authorId?.fullName || blog.author || 'K').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {blog.authorId?.fullName || blog.author || 'KT Clinic'}
                  </p>
                  <p className="text-[11px] text-slate-400">{timeAgo(blog.createdAt)}</p>
                </div>
              </div>

              {(isOwner || user?.role === 'admin') && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(blog)}
                    className="p-1.5 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 rounded-lg transition"
                    title="Sửa bài"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(blog._id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                    title="Xóa bài"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Tiêu đề bài viết */}
            <h3
              onClick={() => onViewDetail(blog)}
              className="font-bold text-slate-900 dark:text-white text-base mb-2 hover:text-brand-600 dark:hover:text-brand-400 transition cursor-pointer line-clamp-2 leading-snug"
            >
              {blog.title}
            </h3>

            {/* Đoạn trích ngắn */}
            <p className={`text-xs text-slate-500 dark:text-slate-400 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
              {blog.content}
            </p>

            {blog.content?.length > 180 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-1.5 hover:underline"
              >
                {isExpanded ? 'Thu gọn' : 'Đọc thêm...'}
              </button>
            )}

            {/* Ảnh bổ sung khi mở rộng */}
            {isExpanded && displayImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {displayImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt=""
                    className="rounded-xl h-28 w-full object-cover border border-slate-100 dark:border-slate-800"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Card Footer: Lượt thích, Bình luận, Nút xem chi tiết */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-xs font-semibold transition ${
                  liked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
                <span>{likeCount}</span>
              </button>
              <button
                onClick={() => onViewDetail(blog)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-brand-500 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{(blog.comments || []).length}</span>
              </button>
            </div>

            <button
              onClick={() => onViewDetail(blog)}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 group/link"
            >
              <span>Chi tiết</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Bình luận trực tiếp nếu mở rộng */}
          {isExpanded && (
            <CommentSection blog={blog} user={user} onUpdate={onUpdate} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// COMPONENT: MODAL ĐỌC BÀI CHI TIẾT
// ==========================================
function BlogDetailModal({ blog, user, onClose, onUpdate, onEdit, onDelete }) {
  const [liked, setLiked] = useState(user ? (blog.likes || []).includes(user._id) : false);
  const [likeCount, setLikeCount] = useState((blog.likes || []).length);
  const isOwner = user && blog.authorId && (blog.authorId._id === user._id || blog.authorId === user._id);
  const { showAlert } = useAlert();

  const handleLike = async () => {
    if (!user) {
      showAlert('Thông báo', 'Vui lòng đăng nhập để bày tỏ yêu thích', 'info');
      return;
    }
    try {
      const res = await axios.post(`/api/blogs/${blog._id}/like`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setLiked(res.data.liked);
      setLikeCount(res.data.likes);
    } catch {}
  };

  const coverImg = blog.image || (blog.images && blog.images.length > 0 ? blog.images[0] : DEFAULT_IMAGE);
  const allImages = [
    ...(blog.image ? [blog.image] : []),
    ...(blog.images || [])
  ];
  // Deduplicate
  const uniqueImages = Array.from(new Set(allImages));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl my-8 bg-slate-100 dark:bg-white/5 p-2 ring-1 ring-slate-200/80 dark:ring-white/10 rounded-[2.5rem] shadow-2xl"
      >
        <div className="bg-white dark:bg-[#15181e] rounded-[calc(2.5rem-0.5rem)] overflow-hidden shadow-sm max-h-[85vh] flex flex-col">
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-[#15181e]/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-xs">
                {(blog.authorId?.fullName || blog.author || 'K').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {blog.authorId?.fullName || blog.author || 'Bác sĩ KT Clinic'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {timeAgo(blog.createdAt)} · {readingTime(blog.content)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(isOwner || user?.role === 'admin') && (
                <>
                  <button
                    onClick={() => { onClose(); onEdit(blog); }}
                    className="p-2 text-brand-600 hover:bg-brand-50 rounded-xl transition"
                    title="Sửa bài"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { onClose(); onDelete(blog._id); }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                    title="Xóa bài"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body cuộn */}
          <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Ảnh bìa lớn */}
            <div className="relative rounded-3xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] bg-slate-100 dark:bg-slate-800 shadow-md">
              <img
                src={coverImg}
                alt={blog.title}
                className="w-full h-full object-cover"
                onError={e => { e.target.src = DEFAULT_IMAGE; }}
              />
              {blog.tags && blog.tags.length > 0 && (
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                  {blog.tags.map((t, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-md">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tiêu đề bài viết */}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
              {blog.title}
            </h1>

            {/* Nội dung bài viết */}
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {blog.content}
            </div>

            {/* Bộ sưu tập ảnh đính kèm */}
            {uniqueImages.length > 1 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Hình ảnh thực tế từ bài viết
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {uniqueImages.map((img, idx) => (
                    <div key={idx} className="rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800">
                      <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interaction Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${
                  liked
                    ? 'border-red-200 bg-red-50 text-red-600 dark:bg-red-950/30'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-red-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="text-xs font-bold">{likeCount} Yêu thích</span>
              </button>

              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-brand-500" />
                {(blog.comments || []).length} Lượt thảo luận
              </span>
            </div>

            {/* Phần Bình luận */}
            <CommentSection blog={blog} user={user} onUpdate={onUpdate} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// TRANG CHÍNH: BLOG & DIỄN ĐÀN KT CLINIC
// ==========================================
export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [tab, setTab] = useState('all'); // 'all' | 'my'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'likes' | 'comments'
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [viewingDetailBlog, setViewingDetailBlog] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = getUser();
  const { showAlert, showConfirm } = useAlert();

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Tự động đồng bộ tab khi URL thay đổi (VD: người dùng bấm "Bài viết của tôi" từ menu tài khoản trên Topbar)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'my') {
      setTab('my');
      setActiveCategory('all');
    } else {
      setTab('all');
    }
  }, [searchParams]);

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    if (newTab === 'my') {
      setSearchParams({ tab: 'my' });
      setActiveCategory('all');
    } else {
      setSearchParams({});
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await axios.get('/api/blogs');
      setBlogs(res.data);
    } catch (error) {
      console.error('Lỗi fetch blog', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingBlog) {
        const res = await axios.put(`/api/blogs/${editingBlog._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setBlogs(prev => prev.map(b => b._id === editingBlog._id ? res.data : b));
        if (viewingDetailBlog && viewingDetailBlog._id === editingBlog._id) {
          setViewingDetailBlog(res.data);
        }
      } else {
        const res = await axios.post('/api/blogs', formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setBlogs(prev => [res.data, ...prev]);
      }
      setShowFormModal(false);
      setEditingBlog(null);
      showAlert('Thành công', editingBlog ? 'Cập nhật bài viết thành công' : 'Đăng bài viết mới thành công', 'success');
    } catch (err) {
      showAlert('Lỗi', err.response?.data?.message || 'Lỗi lưu bài viết', 'error');
      throw err;
    }
  };

  const handleDelete = (id) => {
    showConfirm('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa bài viết này?', async () => {
      try {
        await axios.delete(`/api/blogs/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
        setBlogs(prev => prev.filter(b => b._id !== id));
        if (viewingDetailBlog && viewingDetailBlog._id === id) {
          setViewingDetailBlog(null);
        }
        showAlert('Thành công', 'Đã xóa bài viết thành công', 'success');
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.message || 'Lỗi xóa bài viết', 'error');
      }
    });
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setShowFormModal(true);
  };

  const handleUpdateBlog = (updatedBlog) => {
    setBlogs(prev => prev.map(b => b._id === updatedBlog._id ? updatedBlog : b));
    if (viewingDetailBlog && viewingDetailBlog._id === updatedBlog._id) {
      setViewingDetailBlog(updatedBlog);
    }
  };

  // Xác thực bài viết có thuộc về user hiện tại hay không (kiểm tra theo ID và Tên hiển thị)
  const isMyPost = (b) => {
    if (!user) return false;
    const currentUserId = (user._id || user.id)?.toString();
    const authorId = (b.authorId?._id || b.authorId)?.toString();
    const matchId = Boolean(currentUserId && authorId && currentUserId === authorId);
    const matchName = Boolean(b.author && user.fullName && b.author.trim().toLowerCase() === user.fullName.trim().toLowerCase());
    return matchId || matchName;
  };

  // Lọc dữ liệu
  const filteredBlogs = blogs.filter(b => {
    const matchSearch = !search ||
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.content?.toLowerCase().includes(search.toLowerCase()) ||
      (b.tags && b.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));

    const matchTab = tab === 'all' || isMyPost(b);

    const matchCategory = activeCategory === 'all' ||
      (b.tags && b.tags.some(t => t.toLowerCase().includes(activeCategory.toLowerCase()))) ||
      b.title?.toLowerCase().includes(activeCategory.toLowerCase());

    return matchSearch && matchTab && matchCategory;
  });

  // Sắp xếp
  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    if (sortBy === 'likes') return ((b.likes || []).length) - ((a.likes || []).length);
    if (sortBy === 'comments') return ((b.comments || []).length) - ((a.comments || []).length);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Bài viết tiêu điểm (chỉ hiển thị ở tab Tất cả khi không search hoặc đang ở trang đầu)
  const isDefaultFeed = tab === 'all' && !search && activeCategory === 'all';
  const featuredBlog = isDefaultFeed && sortedBlogs.length > 0 ? sortedBlogs[0] : null;
  const standardBlogs = featuredBlog ? sortedBlogs.slice(1) : sortedBlogs;

  const myPostsCount = blogs.filter(isMyPost).length;

  return (
    <div className="bg-slate-50 dark:bg-[#0f1115] min-h-screen pt-20 transition-colors duration-300">
      {/* ============================================================ */}
      {/* 1. HERO SECTION: KT PET MAGAZINE & COMMUNITY MASTHEAD */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden py-14 sm:py-20 border-b border-slate-200/60 dark:border-slate-800/80 bg-gradient-to-b from-brand-50/50 via-white to-slate-50 dark:from-slate-900/60 dark:via-[#11141a] dark:to-[#0f1115]">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-gradient-to-r from-brand-400/10 via-emerald-400/10 to-teal-400/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            {/* Pill Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-200/60 dark:border-brand-700/40 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-[0.15em] mb-4 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span>KT PET MAGAZINE & DIỄN ĐÀN CHĂM SÓC</span>
            </motion.div>

            {/* H1 Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-[1.15]"
            >
              Chia Sẻ Yêu Thương & <br className="hidden sm:inline" />
              <span className="text-gradient-teal">Tri Thức Thú Cưng</span> 🐾
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed"
            >
              Diễn đàn kết nối cộng đồng người yêu thú cưng, tổng hợp cẩm nang chăm sóc chuẩn y khoa và câu chuyện đời thường ấm áp từ đội ngũ bác sĩ thú y KT Clinic.
            </motion.p>
          </div>

          {/* Quick Metrics Bar: 4 Double-Bezel Micro Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mb-10"
          >
            {[
              { icon: BookOpen, label: 'Bài viết chia sẻ', val: `${blogs.length > 0 ? blogs.length + 120 : 120}+`, color: 'text-brand-600 dark:text-brand-400' },
              { icon: Stethoscope, label: 'Bác sĩ trực tuyến', val: '15+ Chuyên gia', color: 'text-blue-600 dark:text-blue-400' },
              { icon: Heart, label: 'Cộng đồng yêu thương', val: '4,800+ Pet Lovers', color: 'text-red-500' },
              { icon: Phone, label: 'Tư vấn y tế 24/7', val: '0901 234 567', color: 'text-amber-600 dark:text-amber-400' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="p-1 bg-white/60 dark:bg-white/5 ring-1 ring-slate-200/80 dark:ring-white/10 rounded-2xl backdrop-blur-sm shadow-sm">
                  <div className="bg-white dark:bg-[#15181e] rounded-xl p-3.5 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 ${stat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{stat.val}</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Search & Action Bar with Double-Bezel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <div className="p-1.5 bg-white/80 dark:bg-slate-900/80 ring-1 ring-slate-200/80 dark:ring-white/10 rounded-full shadow-lg backdrop-blur-md flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full">
                <Search className="w-5 h-5 text-brand-500 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm kiếm mẹo nuôi mèo, dinh dưỡng cún, lịch tiêm phòng..."
                  className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {user ? (
                <button
                  onClick={() => { setEditingBlog(null); setShowFormModal(true); }}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white text-xs sm:text-sm font-bold shadow-glow-brand flex items-center justify-center gap-2.5 transition active:scale-[0.98] shrink-0"
                >
                  <span>Viết bài chia sẻ</span>
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5 text-white" />
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shrink-0"
                >
                  <span>Đăng nhập để viết bài</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. CHỦ ĐỀ CHÍNH & BỘ LỌC CATEGORIES */}
      {/* ============================================================ */}
      <section className="sticky top-16 z-20 bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/80 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Category Chips Ribbon */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {CATEGORIES.map(cat => {
                const isSelected = activeCategory === (cat.tag || 'all');
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.tag || 'all')}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/20'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Tab "Tất cả" vs "Của tôi" & Sắp xếp */}
            <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
              {/* Tab Selector */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800/90 rounded-full">
                <button
                  onClick={() => handleTabSwitch('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                    tab === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Tất cả ({blogs.length})
                </button>
                {user && (
                  <button
                    onClick={() => handleTabSwitch('my')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                      tab === 'my'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Của tôi</span>
                    <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center">
                      {myPostsCount}
                    </span>
                  </button>
                )}
              </div>

              {/* Sắp xếp */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                aria-label="Sắp xếp bài viết"
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-full px-3 py-1.5 border-none focus:ring-2 focus:ring-brand-500/20 outline-none"
              >
                <option value="newest">Mới nhất</option>
                <option value="likes">Nhiều yêu thích nhất</option>
                <option value="comments">Sôi nổi nhất</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. MAIN CONTENT: ASYMMETRICAL 12-COLUMN MAGAZINE LAYOUT */}
      {/* ============================================================ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Loading Skeletons */}
        {loading ? (
          <div className="space-y-6">
            <div className="h-96 rounded-[2.5rem] bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 rounded-[2rem] bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          </div>
        ) : filteredBlogs.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center bg-white dark:bg-[#15181e] rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {search
                ? 'Không tìm thấy bài viết phù hợp'
                : tab === 'my'
                ? 'Bạn chưa có bài viết nào'
                : 'Chưa có bài viết nào'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              {search
                ? `Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem toàn bộ cẩm nang thú cưng.`
                : tab === 'my'
                ? 'Bạn chưa đăng bài viết nào. Hãy chia sẻ câu chuyện thú cưng đầu tiên của bạn cùng KT Clinic!'
                : 'Hãy là người đầu tiên chia sẻ kinh nghiệm chăm sóc thú cưng cùng cộng đồng!'}
            </p>
            {search ? (
              <button
                onClick={() => { setSearch(''); setActiveCategory('all'); }}
                className="btn-secondary py-2.5 px-6 text-xs font-bold"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            ) : user ? (
              <button
                onClick={() => { setEditingBlog(null); setShowFormModal(true); }}
                className="btn-primary py-2.5 px-6 text-xs font-bold"
              >
                <Plus className="w-4 h-4" /> {tab === 'my' ? 'Đăng bài viết đầu tiên của bạn' : 'Đăng bài viết ngay'}
              </button>
            ) : null}
          </div>
        ) : (
          <div>
            {/* Spotlight Article (Hero Magazine Card) */}
            {featuredBlog && (
              <FeaturedBlogCard
                blog={featuredBlog}
                user={user}
                onUpdate={handleUpdateBlog}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetail={setViewingDetailBlog}
              />
            )}

            {/* Asymmetrical 12-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* CỘT TRÁI (8 COLS): LƯỚI BÀI VIẾT CHÍNH */}
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{tab === 'my' ? 'Bài viết của tôi' : 'Khám phá bài viết'}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-semibold">
                      {tab === 'my' ? `${myPostsCount} bài viết` : `${standardBlogs.length + (featuredBlog ? 1 : 0)} bài viết`}
                    </span>
                  </h3>
                </div>

                {standardBlogs.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-[#15181e] rounded-3xl border border-slate-200/80 dark:border-slate-800">
                    <p className="text-xs text-slate-400">Đã hiển thị hết bài viết theo bộ lọc hiện tại.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {standardBlogs.map(blog => (
                      <BlogCard
                        key={blog._id}
                        blog={blog}
                        user={user}
                        onUpdate={handleUpdateBlog}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onViewDetail={setViewingDetailBlog}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* CỘT PHẢI (4 COLS): STICKY COMMUNITY & CLINIC SIDEBAR */}
              <aside className="lg:col-span-4 space-y-6 sticky top-36">
                {/* WIDGET 1: GÓC BÁC SĨ TRƯỞNG KT CLINIC */}
                <div className="p-1.5 bg-gradient-to-br from-brand-100/70 to-emerald-50 dark:from-slate-800 dark:to-slate-900 ring-1 ring-brand-200/60 dark:ring-white/10 rounded-[2rem] shadow-sm">
                  <div className="bg-white dark:bg-[#15181e] rounded-[calc(2rem-0.375rem)] p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-base font-bold shadow-md">
                        K
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">BS. Triệu Duy Khang</h4>
                          <ShieldCheck className="w-4 h-4 text-brand-500" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Bác sĩ trưởng · KT Pet Clinic</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 italic">
                      "Phòng bệnh hơn chữa bệnh. Đừng bỏ lỡ lịch tiêm phòng dại và tẩy giun định kỳ để thú cưng luôn khỏe mạnh, hoạt bát và gắn kết bên bạn!"
                    </div>

                    <button
                      onClick={() => navigate('/booking')}
                      className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Đặt lịch khám sức khỏe ngay</span>
                    </button>
                  </div>
                </div>

                {/* WIDGET 2: CHỦ ĐỀ SÔI NỔI (TRENDING TAGS) */}
                <div className="p-1.5 bg-slate-100 dark:bg-white/5 ring-1 ring-slate-200/80 dark:ring-white/10 rounded-[2rem] shadow-sm">
                  <div className="bg-white dark:bg-[#15181e] rounded-[calc(2rem-0.375rem)] p-5">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-brand-500" />
                      Chủ đề quan tâm tuần này
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {TRENDING_TAGS.map(tag => (
                        <button
                          key={tag}
                          onClick={() => { setSearch(tag); }}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/30 text-slate-600 dark:text-slate-300 text-xs font-semibold transition border border-slate-100 dark:border-slate-800"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* WIDGET 3: HOTLINE CẤP CỨU THÚ Y 24/7 */}
                <div className="p-1.5 bg-gradient-to-br from-amber-500/20 via-red-500/10 to-brand-500/10 ring-1 ring-amber-400/40 rounded-[2rem] shadow-sm">
                  <div className="bg-white dark:bg-[#15181e] rounded-[calc(2rem-0.375rem)] p-5">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <span>Cấp cứu Thú Y 24/7</span>
                    </div>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
                      0901 234 567
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                      Đội xe cấp cứu phản ứng nhanh và y bác sĩ trực 24/7 sẵn sàng xử lý các trường hợp sốc nhiệt, ngộ độc, chấn thương.
                    </p>
                    <a
                      href="tel:0901234567"
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Gọi cấp cứu khẩn cấp</span>
                    </a>
                  </div>
                </div>

                {/* WIDGET 4: VĂN HÓA CHIA SẺ VĂN MINH */}
                <div className="p-1.5 bg-slate-100 dark:bg-white/5 ring-1 ring-slate-200/80 dark:ring-white/10 rounded-[2rem] shadow-sm">
                  <div className="bg-white dark:bg-[#15181e] rounded-[calc(2rem-0.375rem)] p-5">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
                      Văn hóa cộng đồng KT Clinic
                    </h4>
                    <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                        <span>Chia sẻ kinh nghiệm thực tế, văn minh và tôn trọng tình yêu động vật.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                        <span>Khi thú cưng có dấu hiệu bệnh nặng, hãy liên hệ ngay cơ sở thú y gần nhất.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                        <span>Cùng nhau lan tỏa lối sống trách nhiệm và nhân ái với thú cưng.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* 4. MODAL: ĐĂNG / CHỈNH SỬA BÀI VIẾT */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showFormModal && (
          <BlogFormModal
            initial={editingBlog}
            onSave={handleSave}
            onClose={() => { setShowFormModal(false); setEditingBlog(null); }}
          />
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 5. MODAL: ĐỌC BÀI VIẾT CHI TIẾT & BÌNH LUẬN */}
      {/* ============================================================ */}
      <AnimatePresence>
        {viewingDetailBlog && (
          <BlogDetailModal
            blog={viewingDetailBlog}
            user={user}
            onClose={() => setViewingDetailBlog(null)}
            onUpdate={handleUpdateBlog}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
