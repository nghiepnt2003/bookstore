const Product = require("../models/Product");

class ProductController {
  // [POST] /product/create
  async create(req, res) {
    try {
      const { name, price, pageNumber, author, publisher } = req.body;

      if (!name || !price || !pageNumber || !author || !publisher) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }

      const product = new Product(req.body);
      const savedProduct = await product.save();

      // Trả về tài liệu đã lưu thành công
      res.status(201).json({
        success: true,
        message: "Create product successful",
        data: savedProduct,
      });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ success: false, message: "An error occurred " + err });
    }
  }
}

module.exports = new ProductController();
