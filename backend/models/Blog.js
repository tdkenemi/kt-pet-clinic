const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String }, // URL ảnh bìa
  images: [{ type: String }], // Mảng ảnh nội dung (base64 hoặc URL)
  author: { type: String, default: 'KT Pet Clinic' }, // Tên tác giả (display)
  authorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
  },
  comments: [commentSchema],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
