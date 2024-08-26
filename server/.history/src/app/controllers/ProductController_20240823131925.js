const Product = require("../models/Product");

class ProductController {
  // [POST] /product/store
  async store(req, res) {
    try {
      const { name, price, pageNumber } = req.body;

      if (!name || !price || !pageNumber) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }

      const author = new Author(req.body);
      const savedAuthor = await author.save();

      // Trả về tài liệu đã lưu thành công
      res.status(201).json({
        success: true,
        message: "Create successful",
        data: savedAuthor,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: "An error occurred" });
    }
  }
}

module.exports = new ProductController();
