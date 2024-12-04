const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");

class OrderService {
  async getOrderById(orderId, userId) {
    try {
      // Tìm order và populate thông tin chi tiết
      let order = await Order.findOne({ _id: orderId }).populate({
        path: "details",
        model: "OrderDetail",
      });

      // Kiểm tra quyền sở hữu
      if (!order || order.user.toString() !== userId.toString()) {
        return {
          success: false,
          message: "Access denied: This order does not belong to you.",
        };
      }

      return {
        success: true,
        order,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = new OrderService();
