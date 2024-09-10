class FeedbackController {
  // [POST] /feedback/rating
  async rating(req, res) {
    try {
      const { _id } = req.user;
      const product = new Product(req.body);
      const savedProduct = await product.save();

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
