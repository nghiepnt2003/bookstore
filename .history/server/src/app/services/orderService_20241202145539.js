const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const LineItem = require("../models/LineItem");
const User = require("../models/User");
const { Payment } = require("../models/Payment");
const QRCode = require("qrcode");
const Member = require("../models/Member");
const qs = require("qs");
const moment = require("moment");
const CryptoJS = require("crypto-js");
const axios = require("axios");
const crypto = require("crypto");

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

  async getAllOrdersByAdmin(queryParams) {
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
      let queryCommand = Order.find(formatedQueries).populate({
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
      const counts = await Order.find(formatedQueries).countDocuments();

      return {
        success: orders.length > 0,
        counts,
        orders: orders.length > 0 ? orders : "Cannot get orders",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getOrdersByTimeRange(userId, queryParams) {
    try {
      const {
        startTime,
        endTime,
        sort,
        fields,
        page = 1,
        limit = 10,
        ...filters
      } = queryParams;

      // Kiểm tra nếu startTime hoặc endTime không được cung cấp
      if (!startTime || !endTime) {
        throw new Error("Please provide both startTime and endTime.");
      }

      // Chuyển đổi startTime và endTime thành kiểu Date
      const start = new Date(startTime);
      const end = new Date(new Date(endTime).setHours(23, 59, 59, 999));

      // Format lại các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(filters);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      // Thêm điều kiện thời gian và trạng thái Successed vào formatedQueries
      formatedQueries.date = { $gte: start, $lte: end };
      formatedQueries.status = "Successed";

      // Query chính
      let queryCommand = Order.find({
        user: userId,
        ...formatedQueries,
      }).populate({
        path: "details",
        model: "OrderDetail",
      });

      // Sắp xếp nếu có tham số sort
      if (sort) {
        const sortBy = sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Lọc các trường cần thiết nếu có tham số fields
      if (fields) {
        const selectFields = fields.split(",").join(" ");
        queryCommand = queryCommand.select(selectFields);
      }

      // Phân trang
      const paginationLimit = +limit || 10;
      const paginationPage = +page || 1;
      const skip = (paginationPage - 1) * paginationLimit;
      queryCommand = queryCommand.skip(skip).limit(paginationLimit);

      // Thực thi query
      const orders = await queryCommand.exec();

      // Tính tổng tiền của các đơn hàng tìm được
      const totalAmount = orders.reduce(
        (sum, order) => sum + order.totalPrice,
        0
      );

      // Đếm số lượng đơn hàng
      const counts = await Order.find({
        user: userId,
        ...formatedQueries,
      }).countDocuments();

      return {
        success: orders.length > 0,
        counts,
        totalAmount,
        orders:
          orders.length > 0
            ? orders
            : "No successful orders found in the specified time range",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new OrderService();
