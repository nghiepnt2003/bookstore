const Feedback = require("../models/Feedback");
const Product = require("../models/Product");

class FeedbackController {
  // [POST] /feedback/rating
  async rating(req, res) {
    try {
      const { _id } = req.user;
      const { star, product, comment } = req.body;
      if (!star || !productId) throw new Error("Missing inputs");
      const alreadyRating = await Feedback.findOne({ user: _id, product });
      let response;
      if (alreadyRating) {
        // update star and comment
        console.log("update star and comment ");
      } else {
        // create star and comment
        console.log("create star and comment ");
        const feedback = new Feedback(req.body);
         = await feedback.save();
      }
      // Trả về tài liệu đã lưu thành công
      res.status(200).json({
        success: true,
        message: "Rating successful",
        data: savedFeedback,
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred " + err });
    }
  }
}

module.exports = new FeedbackController();
