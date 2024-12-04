const Order = require("../models/Order");

class StatisticsService {
  // Tính toán tổng số đơn hàng và tổng số tiền cho một tháng
  async getTotalByMonth(userId, month, year) {
    const startDate = new Date(year, month - 1, 1); // Ngày đầu tháng
    const endDate = new Date(year, month, 0, 23, 59, 59); // Ngày cuối tháng

    // Lấy các đơn hàng của người dùng trong khoảng thời gian
    const orders = await Order.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
      status: "Successed",
    }).populate({
      path: "details",
      model: "OrderDetail",
      select: "productId productName productImage productPrice quantity",
    });

    // Tính tổng số lượng đơn hàng và tổng số tiền
    const totalOrders = orders.length;
    const totalAmount = orders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    return { totalOrders, totalAmount, orders };
  }

  // Tính toán các sản phẩm bán chạy nhất trong tháng
  async getTopSellingProducts(month, year) {
    const startDate = new Date(year, month - 1, 1); // Ngày đầu tháng
    const endDate = new Date(year, month, 0, 23, 59, 59); // Ngày cuối tháng

    // Lấy tất cả các đơn hàng đã thành công trong tháng
    const orders = await Order.find({
      date: { $gte: startDate, $lte: endDate },
      status: "Successed",
    }).populate("details");

    // Tính toán số lượng bán của mỗi sản phẩm
    const productSales = {};

    orders.forEach((order) => {
      order.details.forEach((detail) => {
        const { productId, quantity } = detail;
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

    // Sắp xếp các sản phẩm theo số lượng bán và lấy 5 sản phẩm bán chạy nhất
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return topProducts;
  }
}

module.exports = new StatisticsService();
