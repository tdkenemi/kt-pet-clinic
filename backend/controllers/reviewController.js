const Review = require('../models/Review');
const Appointment = require('../models/Appointment');

// [User] Gửi đánh giá — chỉ cho phép sau khi lịch hẹn hoàn thành
exports.createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment, images } = req.body;

    if (!appointmentId || !rating) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (lịch hẹn, số sao)' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Số sao phải từ 1 đến 5' });
    }

    // Kiểm tra lịch hẹn tồn tại và thuộc user này
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }
    if (appointment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền đánh giá lịch hẹn này' });
    }
    if (appointment.status !== 'completed') {
      return res.status(400).json({ message: 'Chỉ có thể đánh giá lịch hẹn đã hoàn thành' });
    }

    // Kiểm tra đã đánh giá chưa
    const existing = await Review.findOne({ appointmentId });
    if (existing) {
      return res.status(400).json({ message: 'Lịch hẹn này đã được đánh giá rồi' });
    }

    const review = await Review.create({
      userId: req.user._id,
      appointmentId,
      rating,
      comment: comment || '',
      images: images || [],
      isPublic: true,
    });

    const populated = await Review.findById(review._id).populate('userId', 'fullName avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Public] Lấy danh sách đánh giá công khai (cho trang Reviews)
exports.getPublicReviews = async (req, res) => {
  try {
    const { page = 1, limit = 9, rating } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { isPublic: true };
    if (rating) filter.rating = parseInt(rating);

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('userId', 'fullName avatar')
        .populate({
          path: 'appointmentId',
          select: 'services petId',
          populate: { path: 'petId', select: 'name species' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(filter)
    ]);

    // Tính điểm trung bình
    const allPublic = await Review.find({ isPublic: true }).select('rating');
    const avgRating = allPublic.length > 0
      ? (allPublic.reduce((sum, r) => sum + r.rating, 0) / allPublic.length).toFixed(1)
      : 0;

    const ratingDist = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: allPublic.filter(r => r.rating === star).length
    }));

    res.json({
      reviews,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      avgRating: parseFloat(avgRating),
      totalCount: allPublic.length,
      ratingDist
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [User] Đánh giá của tôi
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate({
        path: 'appointmentId',
        select: 'date services petId',
        populate: { path: 'petId', select: 'name species' }
      })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [User] Kiểm tra lịch hẹn đã đánh giá chưa
exports.checkReviewed = async (req, res) => {
  try {
    const review = await Review.findOne({ appointmentId: req.params.appointmentId });
    res.json({ reviewed: !!review, review: review || null });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Admin] Lấy tất cả đánh giá
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'fullName avatar email')
      .populate({
        path: 'appointmentId',
        select: 'date services petId',
        populate: { path: 'petId', select: 'name species' }
      })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Admin] Phản hồi đánh giá
exports.replyReview = async (req, res) => {
  try {
    const { adminReply } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { adminReply, repliedAt: new Date() },
      { new: true }
    ).populate('userId', 'fullName avatar');
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Admin] Bật/tắt hiển thị đánh giá
exports.togglePublic = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    review.isPublic = !review.isPublic;
    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Admin] Xóa đánh giá vi phạm
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    await review.deleteOne();
    res.json({ message: 'Đã xóa đánh giá' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
