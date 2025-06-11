const Discount = require("../models/Discount");
const Product = require("../models/Product");
const discountService = require("../services/discountService");

class DiscountController {
  //[GET] /discount/:id
  // Lấy chi tiết một chương trình giảm giá theo ID
  async getDiscountById(req, res) {
    try {
      const discountId = req.params.id;
      const discount = await discountService.getDiscountById(discountId);

      res.status(200).json({ success: true, discount });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /discount/
  // Lấy tất cả các chương trình giảm giá
  async getAllDiscounts(req, res) {
    try {
      const queries = { ...req.query };
      const { response, counts } = await discountService.getAllDiscounts(
        queries
      );

      res.status(200).json({
        success: response.length > 0,
        counts,
        discounts: response.length > 0 ? response : "Cannot get discounts",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [POST] /discount
  // Tạo mới một chương trình giảm giá
  async createDiscount(req, res) {
    try {
      const { name, discountPercentage, startDate, endDate } = req.body; // Thêm name vào đây
      const newDiscount = await discountService.createDiscount({
        name,
        discountPercentage,
        startDate,
        endDate,
      });

      res.status(201).json({
        success: true,
        message: "Discount created successfully",
        newDiscount,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  //[PUT] /discount/:id
  // Cập nhật chương trình giảm giá

  // async updateDiscount(req, res) {
  //   try {
  //     const discountId = req.params.id;
  //     const { discountPercentage, startDate, endDate, name } = req.body; // Thêm trường name

  //     // Kiểm tra endDate phải lớn hơn ngày hiện tại
  //     const currentDate = new Date();
  //     if (new Date(endDate) <= currentDate) {
  //       return res.status(500).json({
  //         success: false,
  //         message: "Ngày kết thúc không hợp lệ",
  //       });
  //     }

  //     const updatedDiscount = await discountService.updateDiscount(discountId, {
  //       discountPercentage,
  //       startDate,
  //       endDate,
  //       name, // Thêm name vào đối tượng cập nhật
  //     });

  //     res.status(200).json({
  //       success: true,
  //       message: "Discount updated successfully",
  //       updatedDiscount,
  //     });
  //   } catch (error) {
  //     res.status(500).json({ success: false, message: error.message });
  //   }
  // }
  async updateDiscount(req, res) {
    try {
      const discountId = req.params.id;
      const updatedDiscount = await discountService.updateDiscount(
        discountId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Discount updated successfully",
        updatedDiscount,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [DELETE] /discount/:id
  // Xóa chương trình giảm giá
  async deleteDiscount(req, res) {
    try {
      const discountId = req.params.id;

      await discountService.deleteDiscount(discountId);

      res.status(200).json({
        success: true,
        message: "Discount deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //[PUT] /discount/apply-to-all/:discountId
  async applyDiscountToAllProducts(req, res) {
    try {
      const { discountId } = req.params;

      const updatedProducts = await discountService.applyDiscountToAllProducts(
        discountId
      );

      res.status(200).json({
        success: true,
        message: `Discount applied to all ${updatedProducts.length} products successfully`,
        updatedProducts,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [PUT] /discount/apply/:productId/:discountId
  // Áp dụng giảm giá cho một sản phẩm
  async applyDiscountToProduct(req, res) {
    try {
      const { productId, discountId } = req.params;

      const updatedProduct = await discountService.applyDiscountToProduct(
        productId,
        discountId
      );

      res.status(200).json({
        success: true,
        message: `Discount applied to product ${productId} successfully`,
        updatedProduct,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new DiscountController();
