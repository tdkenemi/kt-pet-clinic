const Message = require('../models/Message');
const User = require('../models/User');

// Admin: Get all conversations (list of users who have chatted)
exports.getConversations = async (req, res) => {
  try {
    const messages = await Message.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$userId',
          latestMessage: { $first: '$$ROOT' }
        }
      },
      { $sort: { 'latestMessage.createdAt': -1 } }
    ]);

    const populated = await User.populate(messages, { path: '_id', select: 'fullName email avatar' });
    
    const conversations = populated.map(p => ({
      user: p._id,
      latestMessage: p.latestMessage,
      unreadCount: 0 // Simplification for now
    })).filter(c => c.user != null);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải danh sách chat', error: error.message });
  }
};

// Get messages for a specific user
exports.getMessages = async (req, res) => {
  try {
    const targetUserId = req.user.role === 'admin' ? req.params.userId : req.user._id;
    const messages = await Message.find({ userId: targetUserId }).sort({ createdAt: 1 });
    
    // Mark as read
    if (req.user.role === 'admin') {
      await Message.updateMany({ userId: targetUserId, senderType: 'user', isReadByAdmin: false }, { isReadByAdmin: true });
    } else {
      await Message.updateMany({ userId: targetUserId, senderType: 'admin', isReadByUser: false }, { isReadByUser: true });
    }

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải tin nhắn', error: error.message });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { content, targetUserId } = req.body;
    const userId = req.user.role === 'admin' ? targetUserId : req.user._id;
    const senderType = req.user.role === 'admin' ? 'admin' : 'user';

    const message = await Message.create({
      userId,
      senderType,
      content,
      isReadByAdmin: senderType === 'admin',
      isReadByUser: senderType === 'user'
    });

    // Emit via socket
    const io = req.app.get('io');
    if (io) {
      if (senderType === 'user') {
        io.to('admin_room').emit('receive_message', message);
      } else {
        io.to(userId.toString()).emit('receive_message', message);
      }
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi gửi tin nhắn', error: error.message });
  }
};
