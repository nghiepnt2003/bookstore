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

      const response = await ProductService.suggestPopularProducts(
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
      Cloud.single("image")(req, res, async (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            message: "Error uploading image",
            error: err.message,
          });
        }
        const {
          name,
          price,
          costPrice,
          pageNumber,
          author,
          publisher,
          categories,
        } = req.body;
        if (Object.keys(req.body).length === 0)
          return res
            .status(400)
            .json({ success: false, message: "Missing inputs" });

        if (
          !name ||
          !price ||
          !costPrice ||
          !pageNumber ||
          !author ||
          !publisher ||
          !categories
        ) {
          return res
            .status(400)
            .json({ success: false, message: "Missing inputs" });
        }

        // Kiểm tra costPrice < price
        if (costPrice >= price) {
          return res.status(400).json({
            success: false,
            message: "Cost price must be smaller than the selling price.",
          });
        }

        // Nếu có file ảnh, lưu URL vào req.body
        if (req.file && req.file.path) {
          req.body.image = req.file.path; // URL ảnh trên Cloudinary
        }
        const product = new Product(req.body);
        const savedProduct = await product.save();

        // Trả về tài liệu đã lưu thành công
        res.status(200).json({
          success: true,
          message: "Create product successful",
          data: savedProduct,
        });
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred " + err });
    }
  }

  async update(req, res, next) {
    try {
      Cloud.single("image")(req, res, async (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            message: "Error uploading image",
            error: err.message,
          });
        }

        const { id } = req.params;

        // Kiểm tra sự tồn tại của sản phẩm
        const check = await checkDocumentById(Product, id);
        if (!check.exists) {
          return res.status(400).json({
            success: false,
            message: check.message,
          });
        }

        // Lấy sản phẩm hiện tại
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        // Kiểm tra costPrice < price nếu có cập nhật
        if (
          req.body.costPrice &&
          req.body.price &&
          req.body.costPrice >= req.body.price
        ) {
          return res.status(400).json({
            success: false,
            message: "Cost price must be smaller than the selling price.",
          });
        }

        // Xử lý xóa ảnh cũ nếu có ảnh mới được upload
        if (req.file) {
          if (existingProduct.image) {
            // Lấy public_id từ URL của ảnh hiện tại
            const publicId = existingProduct.image
              .split("/")
              .pop()
              .split(".")[0];

            // Xóa ảnh cũ trên Cloudinary
            await cloudinary.uploader.destroy(`bookstore/${publicId}`);
          }

          // Lấy URL của ảnh mới từ Cloudinary
          req.body.image = req.file.path; // Lưu URL của ảnh mới
        }

        // Cập nhật sản phẩm
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
          new: true,
        })
          .populate("categories")
          .populate("author")
          .populate("publisher");

        res.status(200).json({
          success: true,
          message: "Product update successful",
          data: updatedProduct,
        });
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
      const check = await checkDocumentById(Product, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }

      // Tìm tất cả LineItems liên kết với Product và set product = null
      await LineItem.updateMany({ product: id }, { product: null });

      // Xóa mềm product
      await Product.delete({ _id: id });

      res.status(200).json({
        success: true,
        message: "Delete successful, LineItems updated",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error,
      });
    }
  }

  // [DELETE] /product/:id/force
  async forceDelete(req, res, next) {
    try {
      const { id } = req.params;

      // Tìm tất cả LineItems liên kết với Product và set product = null
      await LineItem.updateMany({ product: id }, { product: null });

      // Xóa vĩnh viễn product
      await Product.deleteOne({ _id: id });

      res.status(200).json({
        success: true,
        message: "Force delete successful, LineItems updated",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error,
      });
    }
  }

  // [PATCH] /product/:id/restore
  async restore(req, res, next) {
    try {
      await Product.restore({ _id: req.params.id });
      const restoredProduct = await Product.findById(req.params.id);
      if (!restoredProduct) {
        return res.status(400).json({
          success: false,
          message: "Product not found",
        });
      }
      res.status(200).json({
        status: true,
        message: "Restored Product",
        restoredProduct,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred " + error,
      });
    }
  }
}

module.exports = new ProductController();
