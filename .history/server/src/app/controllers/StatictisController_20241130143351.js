const Order = require("../models/Order");

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
        await StatisticsService.getTotalByMonth(userId, month, year);

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

      // Chuyển đổi month và year thành dạng ngày bắt đầu và kết thúc của tháng
      const startDate = new Date(year, month - 1, 1); // Ngày đầu tháng
      const endDate = new Date(year, month, 0, 23, 59, 59); // Ngày cuối tháng

      // Tìm các đơn hàng đã thành công trong tháng đó
      const orders = await Order.find({
        date: { $gte: startDate, $lte: endDate },
        status: "Successed", // Chỉ lấy đơn hàng đã thành công
      }).populate("details");

      // Tính toán tổng số lượng bán cho mỗi sản phẩm
      const productSales = {};

      orders.forEach((order) => {
        order.details.forEach((detail) => {
          const { productId, quantity } = detail;

          // Nếu sản phẩm đã tồn tại trong productSales thì cộng thêm số lượng
          if (productSales[productId]) {
            productSales[productId].quantity += quantity;
          } else {
            productSales[productId] = {
              productId,
              quantity,
            };
          }
        });
      });

      // Chuyển đổi productSales thành mảng và sắp xếp theo số lượng bán
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity) // Sắp xếp theo số lượng giảm dần
        .slice(0, 5); // Lấy 5 sản phẩm bán chạy nhất

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
