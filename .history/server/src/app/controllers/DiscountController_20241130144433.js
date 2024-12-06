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
      const discounts = await discountService.getAllDiscounts();
      res.status(200).json({
        success: discounts.length > 0,
        counts: discounts.length,
        discounts: discounts.length > 0 ? discounts : "Cannot get discounts",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [POST] /discount
  // Tạo mới một chương trình giảm giá
  async createDiscount(req, res) {
    try {
      const { discountPercentage, startDate, endDate } = req.body;

      const newDiscount = await discountService.createDiscount({
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
  async updateDiscount(req, res) {
    try {
      const discountId = req.params.id;
      const { discountPercentage, startDate, endDate } = req.body;

      const updatedDiscount = await discountService.updateDiscount(discountId, {
        discountPercentage,
        startDate,
        endDate,
      });

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
}

module.exports = new DiscountController();