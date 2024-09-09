const Feedback = require("../models/Feedback");
const Product = require("../models/Product");

class FeedbackController {
  // [POST] /feedback/rating
  async rating(req, res) {
    try {
      const { _id } = req.user;
      const { star, product, comment } = req.body;
      if (!star || !product) throw new Error("Missing inputs");
      const alreadyRating = await Feedback.findOne({ user: _id, product });
      let response;
      if (alreadyRating) {
        // update star and comment
        console.log("update star and comment ");
        response = await Feedback.findByIdAndUpdate(
          alreadyRating._id,
          { star, comment },
          { new: true }
        );
      } else {
        // create star and comment
        console.log("create star and comment ");
        const feedback = new Feedback({
          user: _id,
          star,
          product,
          comment,
        });
        response = await feedback.save();
      }
      //Cập nhật lại phần rating trong product
      const feedbacks = await Feedback.find({ product });
      const avgRating = (
        feedbacks.reduce((acc, item) => acc + item.star, 0) / feedbacks.length
      ).toFixed(1); // Giữ 1 chữ số thập phân

      // Cập nhật averageRating trong sản phẩm
      await Product.findByIdAndUpdate(product, {
        averageRating: parseFloat(avgRating),
      });

      // Trả về tài liệu đã lưu thành công
      res.status(200).json({
        success: response ? true : false,
        message: response ? "Rating successful" : "Have an issue ",
        data: response,
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred " + err });
    }
  }
  // [DELETE] /feedback/:id
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Lấy thông tin feedback để cập nhật lại rating của product
      const feedback = await Feedback.findById(id);
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: "Feedback not found",
        });
      }

      // Xóa feedback
      const response = await Feedback.delete({ _id: req.params.id });

      //Cập nhật lại phần rating trong product
      const feedbacks = await Feedback.find({ product });
      const avgRating = (
        feedbacks.reduce((acc, item) => acc + item.star, 0) / feedbacks.length
      ).toFixed(1); // Giữ 1 chữ số thập phân

      // Cập nhật averageRating trong sản phẩm
      await Product.findByIdAndUpdate(product, {
        averageRating: parseFloat(avgRating),
      });

      res.status(200).json({
        success: response ? true : false,
        message: response
          ? "Feedback deleted successfully"
          : "Failed to delete feedback",
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred " + err });
    }
  }
}

module.exports = new FeedbackController();
