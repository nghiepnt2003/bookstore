const Publisher = require("../models/Publisher");

class PublisherController {
  // [POST] /publisher/store
  async store(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }

      const publisher = new Publisher(req.body);
      const savedPublisher = await publisher.save();

      // Trả về tài liệu đã lưu thành công
      res.status(201).json({
        success: true,
        message: "Create successful",
        data: savedPublisher,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: "An error occurred" });
    }
  }
}

module.exports = new PublisherController();
