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

  async getAllOrdersByUser(userId, queryParams) {
    try {
      // Tách các trường đặc biệt ra khỏi query
      const queries = { ...queryParams };
      const excludeFields = ["limit", "sort", "page", "fields"];
      excludeFields.forEach((el) => delete queries[el]);

      // Format lại các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(queries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      // Lọc theo trạng thái nếu có
      if (queries?.status) {
        formatedQueries.status = { $regex: queries.status, $options: "i" };
      }

      // Query chính
      let queryCommand = Order.find({
        user: userId,
        ...formatedQueries,
      }).populate({
        path: "details",
        model: "OrderDetail",
      });

      // Sắp xếp
      if (queryParams.sort) {
        const sortBy = queryParams.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Lọc các trường cần thiết
      if (queryParams.fields) {
        const fields = queryParams.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      // Phân trang
      const page = +queryParams.page || 1;
      const limit = +queryParams.limit || process.env.LIMIT_ORDERS || 10;
      const skip = (page - 1) * limit;
      queryCommand = queryCommand.skip(skip).limit(limit);

      // Thực thi query
      const orders = await queryCommand.exec();

      // Đếm số lượng đơn hàng
      const counts = await Order.find({
        user: userId,
        ...formatedQueries,
      }).countDocuments();

      return {
        success: orders.length > 0,
        counts,
        orders: orders.length > 0 ? orders : "No orders found for this user",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new OrderService();
