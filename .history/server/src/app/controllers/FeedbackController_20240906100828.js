class FeedbackController {
  // [POST] /feedback/store
  async store(req, res) {
    try {
      const { name, price, pageNumber, author, publisher, categories } =
        req.body;
      if (Object.keys(req.body).length === 0) throw new Error("Missing Inputs");

      if (
        !name ||
        !price ||
        !pageNumber ||
        !author ||
        !publisher ||
        !categories
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }
      if (categories && typeof categories === "string") {
        try {
          req.body.categories = JSON.parse(categories).map(Number);
        } catch (error) {
          req.body.categories = categories.split(",").map(Number);
        }
      }

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
