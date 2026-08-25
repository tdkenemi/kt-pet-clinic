const Blog = require('../models/Blog');

// [Public] Lấy tất cả bài viết (có populate author)
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .populate('authorId', 'fullName avatar')
      .populate('comments.userId', 'fullName avatar');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Public] Lấy bài viết của một user
exports.getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ authorId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('authorId', 'fullName avatar')
      .populate('comments.userId', 'fullName avatar');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Login required] Tạo bài viết mới (mọi user đã đăng nhập)
exports.createBlog = async (req, res) => {
  try {
    const { title, content, image, images, tags } = req.body;
    const newBlog = new Blog({
      title,
      content,
      image,
      images: images || [],
      tags: tags || [],
      author: req.user.fullName,
      authorId: req.user._id,
    });
    await newBlog.save();
    const populated = await Blog.findById(newBlog._id)
      .populate('authorId', 'fullName avatar')
      .populate('comments.userId', 'fullName avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Owner hoặc Admin] Cập nhật bài viết
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

    // Kiểm tra quyền: chủ bài hoặc admin
    const isOwner = blog.authorId && blog.authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'veterinarian';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Không có quyền chỉnh sửa bài viết này' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('authorId', 'fullName avatar')
      .populate('comments.userId', 'fullName avatar');
    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Owner hoặc Admin] Xóa bài viết
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

    const isOwner = blog.authorId && blog.authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'veterinarian';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Không có quyền xóa bài viết này' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa bài viết' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Login required] Thêm bình luận
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Nội dung bình luận không được để trống' });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

    blog.comments.push({
      userId: req.user._id,
      content: content.trim(),
    });
    await blog.save();

    const updated = await Blog.findById(req.params.id)
      .populate('authorId', 'fullName avatar')
      .populate('comments.userId', 'fullName avatar');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Comment owner hoặc Admin] Xóa bình luận
exports.deleteComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Không tìm thấy bình luận' });

    const isOwner = comment.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'veterinarian';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Không có quyền xóa bình luận này' });
    }

    comment.deleteOne();
    await blog.save();

    const updated = await Blog.findById(req.params.id)
      .populate('authorId', 'fullName avatar')
      .populate('comments.userId', 'fullName avatar');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Login required] Toggle like
exports.toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

    const userId = req.user._id;
    const likeIndex = blog.likes.indexOf(userId);
    if (likeIndex === -1) {
      blog.likes.push(userId);
    } else {
      blog.likes.splice(likeIndex, 1);
    }
    await blog.save();
    res.json({ likes: blog.likes.length, liked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
