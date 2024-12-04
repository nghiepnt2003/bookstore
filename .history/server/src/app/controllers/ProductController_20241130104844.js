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
      const product = await productService.getById(req.params.id);
      res.status(200).json({ success: !!product, product });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //[GET] /product/
  async getProducts(req, res) {
    try {
      const { products, count } = await productService.getProducts(req.query);
      res.status(200).json({
        success: !!products.length,
        counts: count,
        products: products.length ? products : "Cannot get products",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  // [GET] /product/suggest
  async suggestProducts(req, res) {
    try {
      const user = req.user;
      const products = await productService.suggestProducts(user, req.query);
      res.status(200).json({
        success: !!products.length,
        suggestedProducts: products.length
          ? products
          : "No suggested products found",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //[GET] /product/suggestPopular
  async suggestPopularProducts(req, res) {
    try {
      const user = req.user;
      const products = await productService.suggestPopularProducts(
        user,
        req.query
      );
      res.status(200).json({
        success: !!products.length,
        popularProducts: products.length
          ? products
          : "No popular products found",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
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
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Error uploading image" });
        const savedProduct = await productService.storeProduct({
          ...req.body,
          image: req.file?.path,
        });
        res.status(200).json({
          success: true,
          message: "Create product successful",
          data: savedProduct,
        });
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updatedProduct = await productService.updateProduct(
        req.params.id,
        req.body
      );
      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await productService.deleteProduct(req.params.id);
      res
        .status(200)
        .json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [DELETE] /product/:id/force
  async forceDelete(req, res) {
    try {
      await productService.forceDeleteProduct(req.params.id);
      res
        .status(200)
        .json({ success: true, message: "Force delete successful" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [PATCH] /product/:id/restore
  async restore(req, res) {
    try {
      const restoredProduct = await productService.restoreProduct(
        req.params.id
      );
      res.status(200).json({
        success: true,
        message: "Product restored successfully",
        data: restoredProduct,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ProductController();
