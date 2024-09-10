const Feedback = require("../models/Feedback");
const Product = require("../models/Product");

class FeedbackController {
  // [POST] /feedback/rating
  async rating(req, res) {
    try {
      const { _id } = req.user;
      const { star, product, comment } = req.body;
      if (!star || !productId) throw new Error("Missing inputs");
      const alreadyRating = Feedback.findOne({ user: _id, product });

      // Trả về tài liệu đã lưu thành công
      res.status(200).json({
        success: true,
        message: "Create product successful",
        data: savedProduct,
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred " + err });
    }
  }
}

module.exports = new FeedbackController();
