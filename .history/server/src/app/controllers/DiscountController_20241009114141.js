const Discount = require("../models/Discount");

class DiscountController {
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
