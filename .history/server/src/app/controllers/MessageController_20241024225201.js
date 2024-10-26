const Message = require("../models/Message");
const User = require("../models/User");

class MessageController {
  // [POST] /messages/send
  async sendMessage(req, res) {
    try {
      const { receiver, content, image } = req.body;
      const sender = req.user._id;
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

      res.status(200).json({
        success: true,
        message: "Message sent successfully",
        data: savedMessage,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //[PUT] /messages/:id
  async updateMessage(req, res) {
    try {
      const { id } = req.params;

      // Tìm và cập nhật tin nhắn
      const updatedMessage = await Message.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!updatedMessage) {
        return res
          .status(400)
          .json({ success: false, message: "Message not found" });
      }

      res.status(200).json({
        success: true,
        message: "Message updated successfully",
        data: updatedMessage,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //[DELETE] /messages/:id
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

      res.status(200).json({
        success: true,
        message: "Message deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new MessageController();
