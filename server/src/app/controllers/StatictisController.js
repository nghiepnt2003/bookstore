const Order = require("../models/Order");
const statisticsService = require("../services/statictisService");

class StatictisController {
  // [GET] /statictis/totalByMonth?month=&year=
  async totalByMonth(req, res) {
    try {
      const userId = req.user._id; // Lấy user ID từ access token (phải có middleware xác thực)
      const { month, year } = req.query; // Lấy tháng và năm từ query

      if (!month || !year) {
        return res.status(400).json({
          success: false,
          message: "Month and year are required.",
        });
      }

      // Gọi service để tính toán tổng số đơn hàng và tổng số tiền
      const { totalOrders, totalAmount, orders } =
        await statisticsService.getTotalByMonth(userId, month, year);

      return res.status(200).json({
        success: true,
        totalOrders,
        totalAmount,
        month,
        year,
        orders, // Trả về cả thông tin các đơn hàng, bao gồm cả chi tiết đơn hàng
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
  // [GET] /statictis/top-sellers?month=&year=
  async topSellingProducts(req, res) {
    try {
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({
          success: false,
          message: "Month and year are required.",
        });
      }

      // Gọi service để lấy danh sách sản phẩm bán chạy
      const topProducts = await statisticsService.getTopSellingProducts(
        month,
        year
      );

      return res.status(200).json({
        success: true,
        topProducts,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
module.exports = new StatictisController();
