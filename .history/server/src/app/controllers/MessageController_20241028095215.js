const Message = require("../models/Message");
const User = require("../models/User");

class MessageController {
  // [POST] /message/send
  async sendMessage(req, res) {
    try {
      const { receiver, content, image } = req.body;
      const sender = req.user._id; // Lấy ID người gửi từ req.user
      if (!receiver || (!content && !image)) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      // Kiểm tra người gửi và người nhận có tồn tại không
      const receiverExists = await User.findById(receiver);
      if (!receiverExists) {
        return res
          .status(400)
          .json({ success: false, message: "Receiver not found" });
      }

      // Tạo và lưu tin nhắn
      const message = new Message({ sender, receiver, content, image });
      const savedMessage = await message.save();

      // Gửi tin nhắn cho người nhận qua socket
      req.app
        .get("io")
        .to(receiver.toString())
        .emit("receiveMessage", savedMessage); // Sử dụng io đã được lưu vào app

      res.status(200).json({
        success: true,
        message: "Message sent successfully",
        data: savedMessage,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [PUT] /message/:id
  async updateMessage(req, res) {
    try {
      const { id } = req.params;
      const { content, image } = req.body;

      // Tìm và cập nhật tin nhắn
      const updatedMessage = await Message.findByIdAndUpdate(
        id,
        { content, image },
        { new: true }
      );

      if (!updatedMessage) {
        return res
          .status(400)
          .json({ success: false, message: "Message not found" });
      }

      // Gửi tin nhắn cập nhật cho người nhận qua socket
      req.app
        .get("io")
        .to(updatedMessage.receiver.toString())
        .emit("receiveMessage", updatedMessage);

      res.status(200).json({
        success: true,
        message: "Message updated successfully",
        data: updatedMessage,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  // [PUT] /message/seen/all/:receiverId
  async seenAllMessages(req, res) {
    try {
      const { receiver } = req.params; // ID của người nhận
      const senderId = req.user._id; // Lấy ID người gửi từ req.user

      // Cập nhật trạng thái đã đọc cho tất cả tin nhắn chưa đọc của người gửi dành cho người nhận
      const updatedMessages = await Message.updateMany(
        { sender: senderId, receiver, isRead: false },
        { isRead: true }
      );

      // Kiểm tra xem có tin nhắn nào được cập nhật không
      if (updatedMessages.nModified === 0) {
        return res.status(200).json({
          success: true,
          message: "No unread messages to mark as seen",
        });
      }

      // Gửi thông báo đến người nhận qua socket
      req.app
        .get("io")
        .to(receiverId.toString())
        .emit("allMessagesSeen", { sender: senderId, receiver: receiverId });

      res.status(200).json({
        success: true,
        message: "All unread messages marked as seen successfully",
        data: updatedMessages,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [DELETE] /message/:id
  async deleteMessage(req, res) {
    try {
      const { id } = req.params;

      // Tìm và xóa tin nhắn
      const deletedMessage = await Message.findByIdAndDelete(id);

      if (!deletedMessage) {
        return res
          .status(400)
          .json({ success: false, message: "Message not found" });
      }

      // Gửi thông báo xóa tin nhắn cho người nhận qua socket
      req.app
        .get("io")
        .to(deletedMessage.receiver.toString())
        .emit("deleteMessage", deletedMessage);

      res.status(200).json({
        success: true,
        message: "Message deleted successfully",
        data: deletedMessage,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new MessageController();
