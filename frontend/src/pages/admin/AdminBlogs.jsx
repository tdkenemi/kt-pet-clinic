import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit2, Trash2, Plus, X, Search, BookOpen, MessageCircle,
  Image as ImageIcon, Sparkles, ArrowRight, ShieldCheck, Tag,
  Calendar, Clock, CheckCircle2, Eye, ExternalLink, Heart
} from 'lucide-react';
import { useAlert } from '../../contexts/AlertContext';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop";

const SUGGESTED_TAGS = [
  'Mèo cưng', 'Cún cưng', 'Dinh dưỡng', 'Y tế thú y', 'Huấn luyện', 'Kinh nghiệm'
];

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    images: [],
    tags: ['Mèo cưng'],
  });
  const [tagInput, setTagInput] = useState('');
  const [previewImages, setPreviewImages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef();
  const { showAlert, showConfirm } = useAlert();
  const token = JSON.parse(sessionStorage.getItem('user') || 'null')?.token;

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get('/api/blogs');
      setBlogs(res.data);
    } catch (error) {
      console.error('Lỗi fetch blog admin:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const openNew = () => {
    setFormData({
      title: '',
      content: '',
      image: '',
      images: [],
      tags: ['Mèo cưng'],
    });
    setPreviewImages([]);
    setEditingId(null);
    setShowFormModal(true);
  };

  const openEdit = (blog) => {
    setFormData({
      title: blog.title || '',
      content: blog.content || '',
      image: blog.image || '',
      images: blog.images || [],
      tags: (blog.tags && blog.tags.length > 0) ? blog.tags : ['Mèo cưng'],
    });
    setPreviewImages(blog.images || []);
    setEditingId(blog._id);
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showAlert('Thông báo', 'Vui lòng điền đầy đủ tiêu đề và nội dung', 'warning');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`/api/blogs/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showAlert('Thành công', 'Đã cập nhật bài viết thành công', 'success');
      } else {
        await axios.post('/api/blogs', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showAlert('Thành công', 'Đã đăng bài viết mới thành công', 'success');
      }
      setShowFormModal(false);
      fetchBlogs();
    } catch (error) {
      showAlert('Lỗi', error.response?.data?.message || 'Không thể lưu bài viết', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    showConfirm('Xác nhận xóa', 'Bạn có chắc muốn xóa vĩnh viễn bài viết này khỏi hệ thống?', async () => {
      try {
        await axios.delete(`/api/blogs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchBlogs();
        showAlert('Thành công', 'Đã xóa bài viết thành công', 'success');
      } catch (error) {
        showAlert('Lỗi', error.response?.data?.message || 'Không thể xóa bài viết', 'error');
      }
    });
  };

  const filtered = blogs.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.content?.toLowerCase().includes(search.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.tags && b.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  );

  const totalComments = blogs.reduce((acc, b) => acc + (b.comments?.length || 0), 0);
  const totalLikes = blogs.reduce((acc, b) => acc + (b.likes?.length || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ============================================================ */}
      {/* 1. HEADER & STATS BENTO CARDS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Main Title & Action Bar */}
        <div className="md:col-span-8 p-1.5 bg-gradient-to-br from-brand-100/60 to-emerald-50/40 dark:from-slate-800 dark:to-slate-900 ring-1 ring-brand-200/50 dark:ring-white/10 rounded-[2rem] shadow-sm">
          <div className="bg-white dark:bg-[#15181e] rounded-[calc(2rem-0.375rem)] p-6 sm:p-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Hệ thống biên tập & tin tức</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Quản lý Blog & Cộng đồng
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                Kiểm duyệt, chỉnh sửa và phát hành bài viết y tế thú cưng trên toàn hệ thống KT Clinic.
              </p>
            </div>

            <button
              onClick={openNew}
              className="group/btn inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-glow-brand transition active:scale-[0.98] shrink-0"
            >
              <span>Thêm bài viết mới</span>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:rotate-90 transition-transform duration-300">
                <Plus className="w-3.5 h-3.5 text-white" />
              </span>
            </button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="md:col-span-4 grid grid-cols-2 gap-3">
          <div className="p-1 bg-white/60 dark:bg-white/5 ring-1 ring-slate-200/80 dark:ring-white/10 rounded-2xl shadow-sm">
            <div className="bg-white dark:bg-[#15181e] rounded-xl p-4 flex flex-col justify-center h-full">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Tổng bài viết</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{blogs.length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Bài đã đăng trên diễn đàn</p>
            </div>
          </div>

          <div className="p-1 bg-white/60 dark:bg-white/5 ring-1 ring-slate-200/80 dark:ring-white/10 rounded-2xl shadow-sm">
            <div className="bg-white dark:bg-[#15181e] rounded-xl p-4 flex flex-col justify-center h-full">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                <MessageCircle className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Bình luận</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalComments}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{totalLikes} lượt yêu thích</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SEARCH & FILTER TOOLBAR */}
      {/* ============================================================ */}
      <div className="p-1.5 bg-white/80 dark:bg-slate-900/80 ring-1 ring-slate-200/80 dark:ring-white/10 rounded-2xl shadow-sm backdrop-blur-md flex items-center gap-3">
        <div className="pl-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo tiêu đề, nội dung, tác giả hoặc thẻ #tag..."
          className="flex-1 bg-transparent border-0 px-2 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 mr-2 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. BLOG TABLE LIST */}
      {/* ============================================================ */}
      <div className="p-1.5 bg-slate-100/70 dark:bg-white/5 ring-1 ring-slate-200/80 dark:ring-white/10 rounded-[2rem] shadow-sm">
        <div className="bg-white dark:bg-[#15181e] rounded-[calc(2rem-0.375rem)] overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-400 dark:text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-brand-500" />
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                {search ? 'Không tìm thấy bài viết phù hợp' : 'Chưa có bài viết nào'}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                {search ? 'Thử tìm với từ khóa khác hoặc xóa bộ lọc.' : 'Hãy tạo bài viết đầu tiên để chia sẻ cùng cộng đồng.'}
              </p>
              {search ? (
                <button onClick={() => setSearch('')} className="btn-secondary py-2 px-4 text-xs font-semibold">
                  Xóa tìm kiếm
                </button>
              ) : (
                <button onClick={openNew} className="btn-primary py-2 px-5 text-xs font-bold">
                  <Plus className="w-3.5 h-3.5" /> Thêm bài viết mới
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Bài viết & Chủ đề
                    </th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Tác giả
                    </th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Thời gian
                    </th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">
                      Tương tác
                    </th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map(blog => {
                    const cover = blog.image || (blog.images && blog.images[0]) || DEFAULT_IMAGE;
                    const authorName = blog.authorId?.fullName || blog.author || 'Admin KT Clinic';

                    return (
                      <tr key={blog._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                        {/* Cột bài viết */}
                        <td className="py-4 px-6 align-middle">
                          <div className="flex items-center gap-3.5">
                            <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 ring-1 ring-slate-200/80 dark:ring-white/10 relative">
                              <img
                                src={cover}
                                alt={blog.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={e => { e.target.src = DEFAULT_IMAGE; }}
                              />
                            </div>
                            <div className="min-w-0 max-w-sm">
                              <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                {blog.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                {blog.tags && blog.tags.length > 0 ? (
                                  blog.tags.slice(0, 2).map((t, idx) => (
                                    <span key={idx} className="text-[10px] font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded-md">
                                      #{t}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[10px] text-slate-400">Chưa gắn thẻ</span>
                                )}
                                {blog.images && blog.images.length > 0 && (
                                  <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                    +{blog.images.length} ảnh
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Cột tác giả */}
                        <td className="py-4 px-6 align-middle">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                              {authorName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{authorName}</p>
                              <p className="text-[10px] text-slate-400 truncate">{blog.authorId?.email || 'Tác giả xác thực'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Cột thời gian */}
                        <td className="py-4 px-6 align-middle">
                          <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(blog.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </td>

                        {/* Cột tương tác */}
                        <td className="py-4 px-6 align-middle text-center">
                          <div className="inline-flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                            <span className="flex items-center gap-1 text-red-500 font-semibold text-[11px]">
                              <Heart className="w-3.5 h-3.5 fill-red-500" />
                              {(blog.likes || []).length}
                            </span>
                            <span className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
                            <span className="flex items-center gap-1 text-slate-500 font-semibold text-[11px]">
                              <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                              {(blog.comments || []).length}
                            </span>
                          </div>
                        </td>

                        {/* Cột thao tác */}
                        <td className="py-4 px-6 align-middle text-right space-x-1.5 whitespace-nowrap">
                          <a
                            href="/blog"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition inline-block"
                            title="Xem trang diễn đàn"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => openEdit(blog)}
                            className="p-2 text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-xl transition inline-block"
                            title="Chỉnh sửa bài viết"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(blog._id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition inline-block"
                            title="Xóa bài viết"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MODAL: ĐĂNG / CHỈNH SỬA BÀI VIẾT (DOUBLE-BEZEL ARCHITECTURE) */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl my-8 bg-slate-100 dark:bg-white/5 p-2 ring-1 ring-slate-200/80 dark:ring-white/10 rounded-[2.5rem] shadow-2xl"
            >
              <div className="bg-white dark:bg-[#15181e] rounded-[calc(2.5rem-0.5rem)] p-6 sm:p-8 shadow-sm max-h-[90vh] overflow-y-auto custom-scrollbar">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {editingId ? 'Chỉnh sửa bài viết' : 'Bài viết mới'}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Hệ thống biên tập & kiểm duyệt nội dung KT Pet Clinic
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                  {/* Tiêu đề */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                      Tiêu đề bài viết <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Tiêu đề bài viết..."
                      value={formData.title}
                      required
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="input-field text-base font-semibold"
                    />
                  </div>

                  {/* Chủ đề & Thẻ phân loại */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                      Chủ đề & Thẻ phân loại
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2.5">
                      {SUGGESTED_TAGS.map(tag => {
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

                  {/* Nội dung chi tiết */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Nội dung bài viết <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs text-slate-400">{formData.content.length} ký tự</span>
                    </div>
                    <textarea
                      placeholder="Nội dung bài viết..."
                      value={formData.content}
                      required
                      rows={8}
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
                      placeholder="https://images.unsplash.com/... (hoặc dán link ảnh)"
                      value={formData.image || ''}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                      className="input-field text-xs"
                    />
                    {formData.image && (
                      <div className="mt-3 relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] max-h-56 bg-slate-100 border border-slate-200 dark:border-slate-800">
                        <img
                          src={formData.image}
                          alt="Preview bìa"
                          className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        <span className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                          Xem trước ảnh bìa
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Upload bộ sưu tập ảnh từ thiết bị */}
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
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Nhấn để chọn ảnh từ máy</span>
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
                      onClick={() => setShowFormModal(false)}
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
                        <span>Đang lưu...</span>
                      ) : (
                        <>
                          <span>{editingId ? 'Cập nhật bài viết' : 'Đăng bài viết ngay'}</span>
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
        )}
      </AnimatePresence>
    </div>
  );
}
