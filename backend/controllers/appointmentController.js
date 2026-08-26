const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Notification = require('../models/Notification');

// [Customer/Admin] Đặt lịch hẹn
exports.createAppointment = async (req, res) => {
  const { userId, petId, vetId, date, timeSlot, services, reason, serviceLocation, homeAddress, estimatedPrice, adminPaymentOverride } = req.body;
  try {
    if (!petId || !date || !timeSlot || !services || services.length === 0 || !reason) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (thú cưng, ngày, giờ, dịch vụ, lý do).' });
    }
    if (serviceLocation === 'home' && !homeAddress?.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập địa chỉ khi chọn dịch vụ tại nhà.' });
    }

    // Kiểm tra quyền sở hữu thú cưng (IDOR protection)
    if (req.user.role !== 'admin') {
      const Pet = require('../models/Pet');
      const pet = await Pet.findOne({ _id: petId, ownerId: req.user._id });
      if (!pet) {
        return res.status(403).json({ message: 'Thú cưng không tồn tại hoặc không thuộc sở hữu của bạn.' });
      }
    }

    // Kiểm tra các phương thức thanh toán được phép của từng dịch vụ
    const Service = require('../models/Service');
    const serviceDocs = await Service.find({ name: { $in: services.map(s => s.name) } });
    
    let intersection = ['Cash', 'QR']; // Bắt đầu với full options phổ biến
    for (const doc of serviceDocs) {
      if (doc.allowedPaymentMethods && doc.allowedPaymentMethods.length > 0) {
        intersection = intersection.filter(m => doc.allowedPaymentMethods.includes(m));
      }
    }
    // Fallback nếu rỗng (trường hợp bị xung đột cấu hình hoàn toàn)
    if (intersection.length === 0) intersection = ['Cash'];

    let initialStatus = 'pending';
    let initialPaymentStatus = 'Pending';
    let initialPaymentMethod = undefined;
    let paidAt = undefined;
    let confirmedAt = undefined;

    if (req.user.role === 'admin' && adminPaymentOverride) {
      if (adminPaymentOverride === 'Cash') {
        initialStatus = 'confirmed';
        initialPaymentStatus = 'Paid';
        initialPaymentMethod = 'Cash';
        paidAt = new Date();
        confirmedAt = new Date();
      } else if (adminPaymentOverride === 'QR') {
        initialStatus = 'confirmed';
        initialPaymentStatus = 'Paid';
        initialPaymentMethod = 'QR';
        paidAt = new Date();
        confirmedAt = new Date();
      }
    }

    const appointment = await Appointment.create({
      userId: req.user.role === 'admin' && userId ? userId : req.user._id,
      petId, 
      vetId: req.user.role === 'admin' && vetId ? vetId : undefined,
      date, timeSlot, services, reason,
      serviceLocation: serviceLocation || 'clinic',
      homeAddress: serviceLocation === 'home' ? homeAddress : undefined,
      estimatedPrice: estimatedPrice || 0,
      allowedPaymentMethods: intersection,
      status: initialStatus,
      paymentStatus: initialPaymentStatus,
      paymentMethod: initialPaymentMethod,
      paidAt,
      confirmedAt
    });

    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('new_appointment', appointment);
    }

    res.status(201).json(appointment);
  } catch (error) {
    // [FIX C-03] Xử lý race condition: 2 người đặt cùng bác sĩ, cùng giờ cùng lúc
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: 'Khung giờ này vừa được đặt bởi người khác. Vui lòng chọn khung giờ khác hoặc tải lại trang.' 
      });
    }
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

// [Customer] Xem lịch của mình
exports.MyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .populate('petId', 'name species')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Admin] Xem toàn bộ lịch
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate('userId', 'fullName email phone')
      .populate('petId', 'name species weightKg')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [Admin] Cập nhật trạng thái lịch hẹn (xác nhận, hoàn thành, hủy kèm lý do)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, clinicNote, billingDetails, cancellationReason, notes, travelFee, vetId } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

    const oldStatus = appointment.status;

    if (status) appointment.status = status;
    if (clinicNote !== undefined) appointment.clinicNote = clinicNote;
    if (billingDetails) appointment.billingDetails = billingDetails;
    if (notes !== undefined) appointment.notes = notes;
    if (travelFee !== undefined) appointment.travelFee = Number(travelFee) || 0;
    if (vetId !== undefined) appointment.vetId = vetId;

    // Tự động tính totalPrice = giá dịch vụ + phí di chuyển
    const finalServicePrice = (billingDetails && billingDetails.price > 0) 
      ? billingDetails.price 
      : (appointment.estimatedPrice || 0);
    
    if (billingDetails) {
      appointment.billingDetails.price = finalServicePrice;
    }
    
    appointment.totalPrice = finalServicePrice + (appointment.travelFee || 0);

    if (status === 'confirmed' && !appointment.confirmedAt) {
      appointment.confirmedAt = new Date();
    }
    if (status === 'completed' && !appointment.completedAt) {
      appointment.completedAt = new Date();
    }
    if (status === 'cancelled') {
      appointment.cancelledAt = new Date();
      if (cancellationReason) appointment.cancellationReason = cancellationReason;
      
      // Xử lý hoàn tiền nếu khách đã thanh toán
      if (appointment.paymentStatus === 'Paid') {
        appointment.paymentStatus = 'RefundPending';
      }
    }

    await appointment.save();

    // Trigger Notification
    if (status && status !== oldStatus) { // if status actually changed
      let title = '';
      let message = '';
      let notifType = 'info';

      if (status === 'confirmed') {
        title = 'Lịch hẹn đã được xác nhận';
        message = `Lịch hẹn ngày ${appointment.date} lúc ${appointment.timeSlot} của bạn đã được xác nhận.`;
        notifType = 'success';
      } else if (status === 'completed') {
        title = 'Lịch hẹn hoàn thành';
        message = `Cảm ơn bạn đã sử dụng dịch vụ. Lịch hẹn ngày ${appointment.date} đã hoàn thành.`;
        notifType = 'success';
      } else if (status === 'cancelled') {
        title = 'Lịch hẹn đã bị huỷ';
        message = `Lịch hẹn ngày ${appointment.date} của bạn đã bị huỷ. Lý do: ${cancellationReason || 'Hệ thống tự động huỷ do quá hạn thanh toán'}`;
        notifType = 'error';
      }

      if (title) {
        const notif = await Notification.create({
          userId: appointment.userId,
          title,
          message,
          type: notifType,
          link: '/appointments'
        });
        
        // Phát sự kiện Socket
        const io = req.app.get('io');
        if (io) {
          io.to(appointment.userId.toString()).emit('new_notification', notif);
        }
      }
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Admin] Xác nhận thanh toán tiền mặt
exports.confirmCashPayment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

    appointment.paymentMethod = 'Cash';
    appointment.paymentStatus = 'Paid';
    appointment.paidAt = new Date();
    await appointment.save();
    res.json({ message: 'Đã xác nhận thanh toán tiền mặt', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Admin/Customer] Hủy lịch hẹn có lý do
exports.cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

    if (appointment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền hủy lịch này' });
    }
    if (['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(400).json({ message: 'Lịch hẹn đã hoàn thành hoặc đã hủy, không thể hủy lại.' });
    }

    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = reason || 'Không có lý do';
    
    // Xử lý hoàn tiền nếu khách đã thanh toán
    if (appointment.paymentStatus === 'Paid') {
      appointment.paymentStatus = 'RefundPending';
    }

    await appointment.save();
    res.json({ message: 'Đã hủy lịch hẹn', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Admin/Customer] Cập nhật lịch hẹn (thông tin chung)
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

    if (appointment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Không có quyền sửa' });
    }

    // Customer không được tự cập nhật status. Nếu muốn hủy, phải gọi API /cancel.
    let allowedFields = {};
    if (req.user.role === 'admin') {
      allowedFields = req.body;
    } else {
      // Khách hàng chỉ được cập nhật ghi chú (notes) nếu cần thiết, cấm sửa status
      const { notes } = req.body;
      if (notes !== undefined) allowedFields.notes = notes;
    }

    const updated = await Appointment.findByIdAndUpdate(req.params.id, allowedFields, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Admin] Xóa lịch hẹn (Hard delete)
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

    // Endpoint đã được bảo vệ bởi middleware admin, không cần check role nữa.
    await appointment.deleteOne();
    res.json({ message: 'Đã xóa lịch hẹn' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Customer/Admin] Xóa dịch vụ khỏi lịch hẹn (chỉ khi status pending, chưa thanh toán)
exports.removeServiceFromAppointment = async (req, res) => {
  try {
    const { serviceName } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

    // Kiểm tra quyền: chủ lịch hoặc admin
    if (appointment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền sửa lịch này' });
    }

    // Chỉ cho phép xóa dịch vụ khi lịch đang ở trạng thái 'pending' (chờ duyệt)
    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: 'Chỉ có thể xóa dịch vụ khi lịch ở trạng thái "Chờ duyệt"' });
    }
    if (appointment.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'Không thể xóa dịch vụ vì đã thanh toán' });
    }

    // Kiểm tra dịch vụ
    if (!appointment.services || appointment.services.length === 0) {
      return res.status(400).json({ message: 'Không có dịch vụ nào để xóa' });
    }
    if (appointment.services.length <= 1) {
      return res.status(400).json({ message: 'Phải giữ ít nhất 1 dịch vụ. Nếu muốn hủy toàn bộ, hãy hủy lịch hẹn.' });
    }

    // Xóa dịch vụ theo tên
    const originalLength = appointment.services.length;
    appointment.services = appointment.services.filter(s => s.name !== serviceName);
    
    if (appointment.services.length === originalLength) {
      return res.status(400).json({ message: 'Không tìm thấy dịch vụ này trong lịch hẹn' });
    }
    
    // Cập nhật estimatedPrice = tổng giá các dịch vụ còn lại
    appointment.estimatedPrice = appointment.services.reduce((sum, s) => sum + (s.price || 0), 0);
    
    await appointment.save();
    res.json({ message: 'Đã xóa dịch vụ', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};


// [Customer] Khách hàng chọn phương thức thanh toán (Cash/QR/VNPay)
exports.selectPaymentMethod = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

    if (appointment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền' });
    }

    if (appointment.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'Lịch hẹn đã thanh toán, không thể thay đổi' });
    }

    appointment.paymentMethod = paymentMethod;
    await appointment.save();
    res.json({ message: 'Đã cập nhật phương thức thanh toán', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.getRevenueStats = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      paymentStatus: 'Paid',
    }).populate('userId', 'fullName').populate('petId', 'name');

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const byMonth = Array(12).fill(0);
    const byMethod = { Cash: 0, QR: 0, BankTransfer: 0, Visa: 0, VNPay: 0 };
    let totalRevenue = 0;
    let thisMonthRevenue = 0;

    appointments.forEach(a => {
      const amount = a.totalPrice || a.billingDetails?.price || 0;
      totalRevenue += amount;
      if (a.paidAt) {
        const m = new Date(a.paidAt).getMonth();
        const y = new Date(a.paidAt).getFullYear();
        if (y === thisYear) byMonth[m] += amount;
        if (m === thisMonth && y === thisYear) thisMonthRevenue += amount;
      }
      if (a.paymentMethod && byMethod[a.paymentMethod] !== undefined) {
        byMethod[a.paymentMethod] += amount;
      }
    });

    res.json({
      totalRevenue,
      thisMonthRevenue,
      byMonth,
      byMethod,
      transactions: appointments.slice(0, 50),
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

