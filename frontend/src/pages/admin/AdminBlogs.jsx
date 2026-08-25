import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Plus, X, Search, BookOpen, MessageCircle, Image } from 'lucide-react';
import { useAlert } from '../../contexts/AlertContext';

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', image: '' });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showAlert, showConfirm } = useAlert();

  const token = JSON.parse(sessionStorage.getItem('user') || 'null')?.token;

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get('/api/blogs');
      setBlogs(res.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const filtered = blogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.content.toLowerCase().includes(search.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`/api/blogs/${editingId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('/api/blogs', formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      setShowForm(false);
      setFormData({ title: '', content: '', image: '' });
      setEditingId(null);
      fetchBlogs();
      showAlert('Thành công', editingId ? 'Đã cập nhật bài viết' : 'Đã đăng bài viết', 'success');
    } catch (error) { 
      showAlert('Lỗi', error.response?.data?.message || 'Lỗi lưu', 'error');
    }
    finally { setSaving(false); }
  };

  const handleDelete = (id) => {
    showConfirm('Xác nhận xóa', 'Xóa bài viết này?', async () => {
      try {
        await axios.delete(`/api/blogs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchBlogs();
        showAlert('Thành công', 'Đã xóa bài viết', 'success');
      } catch (error) { 
        showAlert('Lỗi', error.response?.data?.message || 'Lỗi xóa', 'error');
      }
    });
  };

  const openEdit = (blog) => {
    setFormData({ title: blog.title, content: blog.content, image: blog.image || '' });
    setEditingId(blog._id);
    setShowForm(true);
  };

  const openNew = () => {
    setFormData({ title: '', content: '', image: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const defaultImage = "https://images.unsplash.com/photo-1601758174493-6d1a8e1cce72?q=80&w=400&auto=format&fit=crop";

  return (
    <div className="space-y-6">
      {/* Header Bento */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý Blog</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Tất cả bài viết từ cộng đồng — <span className="font-bold text-teal-600 dark:text-teal-400">{blogs.length}</span> bài</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/30 active:scale-95">
          <Plus className="w-5 h-5" /> Thêm bài viết
        </button>
      </div>

      {/* Write/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -16, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -16, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">{editingId ? 'Chỉnh sửa bài viết' : 'Bài viết mới'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tiêu đề *</label>
                  <input
                    required type="text" value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-teal-500 transition-all placeholder:text-slate-400 font-medium"
                    placeholder="Tiêu đề bài viết..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5" /> Ảnh bìa (URL)
                  </label>
                  <input
                    type="text" value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-teal-500 transition-all placeholder:text-slate-400"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image && (
                    <img src={formData.image} alt="preview" className="mt-4 h-40 rounded-2xl object-cover w-full ring-1 ring-slate-200 dark:ring-white/10" onError={e => e.target.style.display = 'none'} />
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Nội dung *</label>
                  <textarea
                    required rows="8" value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border-0 ring-1 ring-slate-200 dark:ring-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-teal-500 transition-all placeholder:text-slate-400 resize-none custom-scrollbar"
                    placeholder="Nội dung bài viết..."
                  />
                  <p className="text-[10px] font-bold text-slate-400 mt-2 text-right">{formData.content.length} ký tự</p>
                </div>
                <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95">Hủy</button>
                  <button type="submit" disabled={saving} className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/30 active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
                    {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Đăng bài')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm p-2 flex items-center gap-3 focus-within:ring-teal-500 transition-all">
        <div className="pl-4">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
        </div>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo tiêu đề, nội dung, tác giả..."
          className="flex-1 bg-transparent border-0 px-2 py-3 text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Blog Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center text-slate-400 dark:text-slate-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-bold text-sm uppercase tracking-wider">{search ? 'Không tìm thấy bài viết' : 'Chưa có bài viết nào'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/50">
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Bài viết</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Tác giả</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Ngày đăng</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Bình luận</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map(blog => (
                  <tr key={blog._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-4 px-6 align-middle">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 ring-1 ring-slate-200 dark:ring-white/10">
                          <img
                            src={blog.image || (blog.images && blog.images[0]) || defaultImage}
                            alt={blog.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={e => { e.target.src = defaultImage; }}
                          />
                        </div>
                        <div className="min-w-0 max-w-[250px]">
                          <p className="font-bold text-slate-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{blog.title}</p>
                          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{blog.content?.substring(0, 60)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-inner">
                          {(blog.authorId?.fullName || blog.author || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{blog.authorId?.fullName || blog.author || 'Admin'}</p>
                          {blog.authorId?.email && <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">{blog.authorId.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{new Date(blog.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1.5 rounded-lg text-xs font-bold ring-1 ring-slate-200 dark:ring-white/10">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {(blog.comments || []).length}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-middle text-right space-x-2">
                      <button onClick={() => openEdit(blog)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors ring-1 ring-transparent hover:ring-blue-200 dark:hover:ring-blue-500/30">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(blog._id)} className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors ring-1 ring-transparent hover:ring-red-200 dark:hover:ring-red-500/30">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
