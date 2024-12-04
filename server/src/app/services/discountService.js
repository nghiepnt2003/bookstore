const Discount = require("../models/Discount");
const Product = require("../models/Product");

class DiscountService {
  // Lấy chi tiết một chương trình giảm giá theo ID
  async getDiscountById(discountId) {
    const discount = await Discount.findById(discountId);
    if (!discount) {
      throw new Error("Discount not found");
    }
    return discount;
  }

  // Lấy tất cả các chương trình giảm giá
  async getAllDiscounts() {
    return await Discount.find();
  }

  // Tạo mới một chương trình giảm giá
  async createDiscount(discountData) {
    const { discountPercentage, startDate, endDate } = discountData;

    if (!discountPercentage || !startDate || !endDate) {
      throw new Error("Missing required fields");
    }

    const newDiscount = new Discount({
      discountPercentage,
      startDate,
      endDate,
    });

    return await newDiscount.save();
  }

  // Cập nhật chương trình giảm giá
  async updateDiscount(discountId, updateData) {
    const updatedDiscount = await Discount.findByIdAndUpdate(
      discountId,
      updateData,
      { new: true }
    );

    if (!updatedDiscount) {
      throw new Error("Discount not found");
    }

    return updatedDiscount;
  }

  // Xóa chương trình giảm giá
  async deleteDiscount(discountId) {
    const deletedDiscount = await Discount.findByIdAndDelete(discountId);

    if (!deletedDiscount) {
      throw new Error("Discount not found");
    }

    return deletedDiscount;
  }

  // Áp dụng giảm giá cho tất cả sản phẩm
  async applyDiscountToAllProducts(discountId) {
    const discount = await Discount.findById(discountId);
    if (!discount) {
      throw new Error("Discount not found");
    }

    const currentDate = new Date();
    if (currentDate > discount.endDate || currentDate < discount.startDate) {
      throw new Error("Discount is not valid or expired");
    }

    // Lấy tất cả sản phẩm
    const products = await Product.find({});
    if (products.length === 0) {
      throw new Error("No products found");
    }

    // Áp dụng giảm giá cho tất cả sản phẩm
    const updatedProducts = [];
    for (let product of products) {
      product.discount = discount._id; // Gán discount cho sản phẩm
      await product.save(); // Lưu sản phẩm
      updatedProducts.push(product);
    }

    return updatedProducts;
  }
}

module.exports = new DiscountService();
