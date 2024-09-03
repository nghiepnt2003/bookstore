const { checkDocumentById } = require("../middlewares/checkDocumentMiddleware");
const Product = require("../models/Product");

class ProductController {
  // [POST] /product/store
  async store(req, res) {
    try {
      const {
        name,
        price,
        pageNumber,
        author,
        publisher,
        categories,
        feedbacks,
      } = req.body;

      if (!name || !price || !pageNumber || !author || !publisher) {
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

  //[PUT] /product/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;

      // Kiểm tra sự tồn tại của tài liệu
      const check = await checkDocumentById(Product, id);

      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }

      const categories = req.body?.categories;
      if (typeof categories === "string") {
        req.body.categories = JSON.parse(categories);
      }
      // Cập nhật product
      const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.status(200).json({
        success: true,
        message: "Product update successful",
        data: updatedProduct,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred : " + error,
      });
    }
  }
}

module.exports = new ProductController();