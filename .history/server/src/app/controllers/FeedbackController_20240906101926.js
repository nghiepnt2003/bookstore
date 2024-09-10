class FeedbackController {
  // [POST] /feedback/create
  async create(req, res) {
    try {
      const { _id } = req.user;
      const { star, productId, comment } = req.body;
      if (!star || !productId) throw new Error("Missing inputs");
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
