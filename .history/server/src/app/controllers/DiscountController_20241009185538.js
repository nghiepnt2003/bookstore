const Discount = require("../models/Discount");

class DiscountController {
  //[GET] /discount/:id
  // Lấy chi tiết một chương trình giảm giá theo ID
  async getDiscountById(req, res) {
    try {
      const discountId = req.params.id;
      const discount = await Discount.findById(discountId);

      if (!discount) {
        return res
          .status(404)
          .json({ success: false, message: "Discount not found" });
      }

      res.status(200).json({ success: true, discount });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error fetching discount", error });
    }
  }

  // [GET] /discount/
  // Lấy tất cả các chương trình giảm giá
  async getAllDiscounts(req, res) {
    try {
      const discounts = await Discount.find();
      res.status(200).json({ success: true, discounts });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error fetching discounts", error });
    }
  }

  // [POST] /discount
  // Tạo mới một chương trình giảm giá
  async createDiscount(req, res) {
    try {
      const { discountPercentage, startDate, endDate } = req.body;

      if (!discountPercentage || !startDate || !endDate) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      const newDiscount = new Discount({
        discountPercentage,
        startDate,
        endDate,
      });

      await newDiscount.save();
      res.status(201).json({
        success: true,
        message: "Discount created successfully",
        newDiscount,
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error creating discount", error });
    }
  }

  //[PUT] /discount/:id
  // Cập nhật chương trình giảm giá
  async updateDiscount(req, res) {
    try {
      const discountId = req.params.id;
      const { discountPercentage, startDate, endDate } = req.body;

      const updatedDiscount = await Discount.findByIdAndUpdate(
        discountId,
        { discountPercentage, startDate, endDate },
        { new: true }
      );

      if (!updatedDiscount) {
        return res
          .status(404)
          .json({ success: false, message: "Discount not found" });
      }

      res.status(200).json({
        success: true,
        message: "Discount updated successfully",
        updatedDiscount,
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error updating discount", error });
    }
  }

  // [DELETE] /discount/:id
  // Xóa chương trình giảm giá
  async deleteDiscount(req, res) {
    try {
      const discountId = req.params.id;
      const deletedDiscount = await Discount.findByIdAndDelete(discountId);

      if (!deletedDiscount) {
        return res.status(404).json({ message: "Discount not found" });
      }

      res.status(200).json({ message: "Discount deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting discount", error });
    }
  }

  //[PUT] /discount/apply-to-all/:discountId
  async applyDiscountToAllProducts(req, res) {
    try {
      const { discountId } = req.params;

      const discount = await Discount.findById(discountId);
      if (!discount) {
        return res
          .status(404)
          .json({ success: false, message: "Discount not found" });
      }

      const currentDate = new Date();
      if (currentDate > discount.endDate || currentDate < discount.startDate) {
        return res.status(400).json({
          success: false,
          message: "Discount is not valid or expired",
        });
      }

      // Lấy tất cả các sản phẩm
      const products = await Product.find({});
      if (products.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No products found" });
      }

      // Áp dụng giảm giá cho tất cả sản phẩm
      const updatedProducts = [];
      for (let product of products) {
        product.discount = discount._id;
        await product.save();
        updatedProducts.push(product);
      }

      res.status(200).json({
        success: false,
        message: `Discount applied to all ${updatedProducts.length} products successfully`,
        updatedProducts,
      });
    } catch (error) {
      res.status(500).json({ message: "Error applying discount", error });
    }
  }
}

module.exports = new DiscountController();
