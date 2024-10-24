const Message = require("../models/Message");
const User = require("../models/User");

class MessageController {
  //[GET] /messages/:id
  async getById(req, res) {
    try {
      let message = await Message.findOne({ _id: req.params.id })
        .populate("sender", "username") // Lấy thông tin người gửi
        .populate("receiver", "username"); // Lấy thông tin người nhận

      res.status(200).json({ success: message ? true : false, message });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //[GET] /messages
  async getAll(req, res) {
    try {
      const queries = { ...req.query };
      const excludeFields = ["limit", "sort", "page", "fields"];
      excludeFields.forEach((el) => delete queries[el]);

      // Format lại các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(queries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      let queryCommand = Message.find(formatedQueries)
        .populate("sender", "username") // Lấy thông tin người gửi
        .populate("receiver", "username"); // Lấy thông tin người nhận

      // Sorting
      if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Fields limiting
      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      // Pagination
      const page = +req.query.page || 1;
      const limit = +req.query.limit || 10; // Giới hạn số lượng tin nhắn mỗi lần
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      const messages = await queryCommand;
      const counts = await Message.find(formatedQueries).countDocuments();

      res.status(200).json({
        success: true,
        counts,
        messages,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [POST] /messages/send
  async sendMessage(req, res) {
    try {
      const { sender, receiver, content, image } = req.body;

      if (!sender || !receiver || !content) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      // Kiểm tra người gửi và người nhận có tồn tại không
      const senderExists = await User.findById(sender);
      const receiverExists = await User.findById(receiver);

      if (!senderExists || !receiverExists) {
        return res
          .status(400)
          .json({ success: false, message: "Sender or Receiver not found" });
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
