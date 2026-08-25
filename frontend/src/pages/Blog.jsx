import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Calendar, User, Clock, ArrowRight, Search,
  Plus, X, Edit2, Trash2, Heart, MessageCircle, Send,
  Image, ChevronDown, ChevronUp, MoreVertical, Flag
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAlert } from '../contexts/AlertContext';

const defaultImage = "https://images.unsplash.com/photo-1601758174493-6d1a8e1cce72?q=80&w=800&auto=format&fit=crop";

function readingTime(content) {
  const words = (content || '').split(' ').length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} phút đọc`;
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

const getUser = () => {
  try { return JSON.parse(sessionStorage.getItem('user') || 'null'); }
  catch { return null; }
};

// Component form đăng/sửa bài
function BlogForm({ initial, onSave, onCancel }) {
  const [formData, setFormData] = useState(initial || { title: '', content: '', image: '', images: [] });
  const [saving, setSaving] = useState(false);
  const [previewImages, setPreviewImages] = useState(initial?.images || []);
  const fileInputRef = useRef();
  const user = getUser();

  const { showAlert } = useAlert();

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { showAlert('Cảnh báo', 'Ảnh quá lớn (tối đa 5MB)', 'warning'); return; }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white border border-blue-100 rounded-3xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-slate-900 text-lg">
          {initial?._id ? '✏️ Chỉnh sửa bài viết' : '✍️ Đăng bài viết mới'}
        </h2>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Tiêu đề bài viết... *"
            value={formData.title}
            required
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="input-field text-base font-semibold"
          />
        </div>

        <div>
          <textarea
            placeholder="Nội dung bài viết của bạn... *"
            value={formData.content}
            required
            rows={6}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            className="input-field resize-none"
          />
          <p className="text-xs text-slate-400 mt-1 text-right">{formData.content.length} ký tự</p>
        </div>

        {/* Ảnh bìa URL */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ảnh bìa (URL)</label>
          <input
            type="text"
            placeholder="https://example.com/image.jpg (tùy chọn)"
            value={formData.image || ''}
            onChange={e => setFormData({ ...formData, image: e.target.value })}
            className="input-field"
          />
          {formData.image && (
            <img src={formData.image} alt="preview" className="mt-2 h-28 rounded-xl object-cover w-full" onError={e => e.target.style.display = 'none'} />
          )}
        </div>

        {/* Upload ảnh từ thiết bị */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Ảnh trong bài (tải từ thiết bị)</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition w-full justify-center"
          >
            <Image className="w-4 h-4" /> Chọn ảnh từ thiết bị
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />

          {previewImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {previewImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img} alt="" className="h-24 w-full object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1 py-2.5">Hủy</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5">
            {saving ? 'Đang đăng...' : (initial?._id ? 'Cập nhật' : '🚀 Đăng bài')}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// Component bình luận
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
      const res = await axios.post(`/api/blogs/${blog._id}/comments`, { content: comment }, {
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
    showConfirm('Xác nhận', 'Xóa bình luận này?', async () => {
      try {
        const res = await axios.delete(`/api/blogs/${blog._id}/comments/${commentId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        onUpdate(res.data);
      } catch {}
    });
  };

  const comments = blog.comments || [];
  const displayComments = showAll ? comments : comments.slice(-3);

  return (
    <div className="mt-6 pt-6 border-t border-slate-100">
      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-blue-500" />
        Bình luận ({comments.length})
      </h4>

      {/* Input bình luận */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 input-field py-2 text-sm"
            />
            <button type="submit" disabled={sending || !comment.trim()} className="btn-primary px-3 py-2">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-slate-400 mb-4 italic">Đăng nhập để bình luận.</p>
      )}

      {/* Danh sách bình luận */}
      {comments.length > 3 && !showAll && (
        <button onClick={() => setShowAll(true)} className="text-sm text-blue-600 hover:underline mb-3 flex items-center gap-1">
          <ChevronDown className="w-4 h-4" /> Xem tất cả {comments.length} bình luận
        </button>
      )}
      <div className="space-y-3">
        {displayComments.map(c => (
          <div key={c._id} className="flex gap-3 group">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(c.userId?.fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 bg-slate-50 rounded-2xl px-3 py-2.5 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900">{c.userId?.fullName || 'Người dùng'}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                  {user && (user._id === c.userId?._id || user.role === 'admin') && (
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-700 mt-0.5">{c.content}</p>
            </div>
          </div>
        ))}
        {showAll && (
          <button onClick={() => setShowAll(false)} className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1">
            <ChevronUp className="w-4 h-4" /> Ẩn bớt
          </button>
        )}
      </div>
    </div>
  );
}

// Component card bài viết
function BlogCard({ blog, user, onUpdate, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(user ? (blog.likes || []).includes(user._id) : false);
  const [likeCount, setLikeCount] = useState((blog.likes || []).length);
  const isOwner = user && blog.authorId && (blog.authorId._id === user._id || blog.authorId === user._id);
  
  // Lọc ảnh body: Nếu dùng ảnh upload đầu tiên làm bìa, thì bỏ qua nó ở phần thân
  const displayImages = blog.image ? blog.images : (blog.images ? blog.images.slice(1) : []);

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await axios.post(`/api/blogs/${blog._id}/like`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setLiked(res.data.liked);
      setLikeCount(res.data.likes);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-lg transition-all"
    >
      {/* Ảnh bìa */}
      <div className="h-52 overflow-hidden bg-slate-100">
        <img
          src={blog.image || (blog.images && blog.images.length > 0 ? blog.images[0] : defaultImage)}
          alt={blog.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = defaultImage; }}
        />
      </div>

      <div className="p-5">
        {/* Author & time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(blog.authorId?.fullName || blog.author || 'K').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">{blog.authorId?.fullName || blog.author || 'KT Pet Clinic'}</p>
              <p className="text-xs text-slate-400">{timeAgo(blog.createdAt)} · {readingTime(blog.content)}</p>
            </div>
          </div>
          {/* Actions chủ bài */}
          {(isOwner || user?.role === 'admin') && (
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit(blog)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(blog._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug">{blog.title}</h3>

        {/* Content preview */}
        <p className={`text-sm text-slate-500 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
          {blog.content}
        </p>
        {blog.content?.length > 200 && (
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-blue-600 mt-1 hover:underline">
            {expanded ? 'Thu gọn' : 'Xem thêm'}
          </button>
        )}

        {/* Ảnh trong bài */}
        {expanded && displayImages && displayImages.length > 0 && (
          <div className={`grid gap-2 mt-3 ${displayImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {displayImages.map((img, idx) => (
              <img key={idx} src={img} alt="" className="rounded-xl w-full object-cover max-h-60" />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm font-medium transition ${liked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
            {likeCount > 0 && likeCount}
          </button>
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-blue-500 transition"
          >
            <MessageCircle className="w-4 h-4" />
            {(blog.comments || []).length > 0 && blog.comments.length}
          </button>
        </div>

        {/* Comment section khi expanded */}
        {expanded && (
          <CommentSection blog={blog} user={user} onUpdate={onUpdate} />
        )}
      </div>
    </motion.div>
  );
}

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [tab, setTab] = useState('all'); // 'all' | 'my'
  const [searchParams] = useSearchParams();
  const user = getUser();
  const { showAlert, showConfirm } = useAlert();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'my' && user) setTab('my');
    fetchBlogs();
  }, []);

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
      } else {
        const res = await axios.post('/api/blogs', formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setBlogs(prev => [res.data, ...prev]);
      }
      setShowForm(false);
      setEditingBlog(null);
      showAlert('Thành công', editingBlog ? 'Cập nhật bài viết thành công' : 'Đăng bài viết thành công', 'success');
    } catch (err) {
      showAlert('Lỗi', err.response?.data?.message || 'Lỗi lưu bài viết', 'error');
      throw err;
    }
  };

  const handleDelete = (id) => {
    showConfirm('Xác nhận xóa', 'Xóa bài viết này?', async () => {
      try {
        await axios.delete(`/api/blogs/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
        setBlogs(prev => prev.filter(b => b._id !== id));
        showAlert('Thành công', 'Đã xóa bài viết', 'success');
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.message || 'Lỗi xóa bài viết', 'error');
      }
    });
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateBlog = (updatedBlog) => {
    setBlogs(prev => prev.map(b => b._id === updatedBlog._id ? updatedBlog : b));
  };

  const filtered = blogs.filter(b => {
    const matchSearch = !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.content.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'all' || (tab === 'my' && user && b.authorId && (b.authorId._id === user._id || b.authorId === user._id));
    return matchSearch && matchTab;
  });

  return (
    <div className="bg-slate-50 min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="section-label">Kiến thức thú cưng</p>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight mt-2">Góc Chia Sẻ 🐾</h1>
              <p className="text-slate-500 mt-2 max-w-md">
                Diễn đàn chia sẻ kiến thức, mẹo chăm sóc và câu chuyện thú cưng từ cộng đồng.
              </p>
            </div>

            {user && (
              <button
                onClick={() => { setEditingBlog(null); setShowForm(!showForm); }}
                className="btn-primary py-2.5 px-5 text-sm self-start shrink-0"
              >
                <Plus className="w-4 h-4" />
                {showForm ? 'Đóng' : 'Đăng bài'}
              </button>
            )}
          </div>
        </motion.div>

        {/* Form đăng/sửa bài */}
        <AnimatePresence>
          {showForm && (
            <div className="mb-6">
              <BlogForm
                initial={editingBlog}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditingBlog(null); }}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Tabs */}
          <div className="flex bg-white border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setTab('all')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Tất cả
            </button>
            {user && (
              <button
                onClick={() => setTab('my')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'my' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Của tôi
              </button>
            )}
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex-1 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Blog list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-slate-200" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">
              {search ? 'Không tìm thấy bài viết phù hợp' :
               tab === 'my' ? 'Bạn chưa có bài viết nào. Hãy chia sẻ điều gì đó!' :
               'Chưa có bài viết nào.'}
            </p>
            {tab === 'my' && user && !showForm && (
              <button onClick={() => setShowForm(true)} className="btn-primary mt-4 py-2.5 px-6 text-sm">
                <Plus className="w-4 h-4" /> Đăng bài đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map(blog => (
              <BlogCard
                key={blog._id}
                blog={blog}
                user={user}
                onUpdate={handleUpdateBlog}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
