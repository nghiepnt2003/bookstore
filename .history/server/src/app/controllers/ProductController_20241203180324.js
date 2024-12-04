const { checkDocumentById } = require("../middlewares/checkDocumentMiddleware");
const Author = require("../models/Author");
const Product = require("../models/Product");
const Publisher = require("../models/Publisher");
const User = require("../models/User");
const Category = require("../models/Category");
const LineItem = require("../models/LineItem");

const Order = require("../models/Order");
const Cloud = require("../../config/cloud/cloudinary.config");
const productService = require("../services/productService");
const cloudinary = require("cloudinary").v2;
class ProductController {
  //[GET] /product/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await productService.getById(id);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //[GET] /product/
  async getProducts(req, res) {
    try {
      const queries = { ...req.query };
      const response = await productService.getProducts(queries);

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  // [GET] /product/suggest
  async suggestProducts(req, res) {
    try {
      const userId = req.user._id; // Lấy user từ token
      const queries = { ...req.query };

      const response = await productService.suggestProducts(userId, queries);

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  //[GET] /product/suggestPopular
  async suggestPopularProducts(req, res) {
    try {
      const userId = req.user._id; // Lấy user từ token
      const queries = { ...req.query };

      const response = await productService.suggestPopularProducts(
        userId,
        queries
      );

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
  // [GET] /products/top-sellers?month=&year=
  // async topSellingProducts(req, res) {
  //   try {
  //     const { month, year } = req.query;

  //     if (!month || !year) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Month and year are required.",
  //       });
  //     }

  //     // Chuyển đổi month và year thành dạng ngày bắt đầu và kết thúc của tháng
  //     const startDate = new Date(year, month - 1, 1); // Ngày đầu tháng
  //     const endDate = new Date(year, month, 0, 23, 59, 59); // Ngày cuối tháng

  //     // Tìm các đơn hàng đã thành công trong tháng đó
  //     const orders = await Order.find({
  //       date: { $gte: startDate, $lte: endDate },
  //       status: "Successed", // Chỉ lấy đơn hàng đã thành công
  //     }).populate("details");

  //     // Tính toán tổng số lượng bán cho mỗi sản phẩm
  //     const productSales = {};

  //     orders.forEach((order) => {
  //       order.details.forEach((detail) => {
  //         const { productId, quantity } = detail;

  //         // Nếu sản phẩm đã tồn tại trong productSales thì cộng thêm số lượng
  //         if (productSales[productId]) {
  //           productSales[productId].quantity += quantity;
  //         } else {
  //           productSales[productId] = {
  //             productId,
  //             quantity,
  //           };
  //         }
  //       });
  //     });

  //     // Chuyển đổi productSales thành mảng và sắp xếp theo số lượng bán
  //     const topProducts = Object.values(productSales)
  //       .sort((a, b) => b.quantity - a.quantity) // Sắp xếp theo số lượng giảm dần
  //       .slice(0, 5); // Lấy 5 sản phẩm bán chạy nhất

  //     return res.status(200).json({
  //       success: true,
  //       topProducts,
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

  // [POST] /product/store
  async store(req, res) {
    try {
      // Gọi service để xử lý logic lưu sản phẩm
      const result = await productService.createProduct(req);

      // Trả về kết quả từ service
      res.status(result.status).json(result.response);
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred: " + err.message });
    }
  }

  async update(req, res, next) {
    try {
      Cloud.single("image")(req, res, async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: "Error uploading image",
            error: err.message,
          });
        }

        const { id } = req.params;

        // Kiểm tra sự tồn tại của sản phẩm
        const check = await productService.checkDocumentById(Product, id);
        if (!check.exists) {
          return res.status(400).json({
            success: false,
            message: check.message,
          });
        }

        try {
          const updatedProduct = await productService.updateProduct(
            id,
            req.body,
            req.file
          );

          res.status(200).json({
            success: true,
            message: "Product update successful",
            data: updatedProduct,
          });
        } catch (error) {
          res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Gọi service để xử lý xóa Product
      try {
        const response = await productService.deleteProduct(id);
        res.status(200).json(response);
      } catch (error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  // [DELETE] /product/:id/force
  async forceDelete(req, res, next) {
    try {
      const { id } = req.params;

      // Gọi service để xử lý xóa vĩnh viễn Product
      try {
        const response = await productService.forceDeleteProduct(id);
        res.status(200).json(response);
      } catch (error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  // [PATCH] /product/:id/restore
  async restore(req, res, next) {
    try {
      const { id } = req.params;

      // Gọi service để khôi phục sản phẩm
      try {
        const restoredProduct = await productService.restoreProduct(id);
        res.status(200).json({
          success: true,
          message: "Restored Product",
          restoredProduct,
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }
}

module.exports = new ProductController();
