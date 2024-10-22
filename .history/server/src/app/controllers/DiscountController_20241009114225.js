const Discount = require("../models/Discount");

class DiscountController {
  // [GET] /discount/
  // Lấy tất cả các chương trình giảm giá
  async getAllDiscounts(req, res) {
    try {
      const discounts = await Discount.find();
      res.status(200).json({ discounts });
    } catch (error) {
      res.status(500).json({ message: "Error fetching discounts", error });
    }
  }

  // [POST] /discount
  // Tạo mới một chương trình giảm giá
  async createDiscount(req, res) {
    try {
      const { discountPercentage, startDate, endDate } = req.body;

      if (!discountPercentage || !startDate || !endDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newDiscount = new Discount({
        discountPercentage,
        startDate,
        endDate,
      });

      await newDiscount.save();
      res
        .status(201)
        .json({ message: "Discount created successfully", newDiscount });
    } catch (error) {
      res.status(500).json({ message: "Error creating discount", error });
    }
  }
}

module.exports = new DiscountController();
