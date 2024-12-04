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

const config = {
  app_id: "2554" || process.env.ZALO_APP_IP,
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn" || process.env.ZALO_KEY1,
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf" || process.env.ZALO_KEY2,
  endpoint:
    "https://sb-openapi.zalopay.vn/v2/create" || process.env.ZALO_ENDPOINT,
};
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

  async checkPaymentStatusZaloPay(appTransId) {
    try {
      // Kiểm tra nếu không có appTransId
      if (!appTransId) {
        throw new Error("app_trans_id is required");
      }

      // Tạo dữ liệu để gửi đến ZaloPay
      const postData = {
        app_id: config.app_id,
        app_trans_id: appTransId,
      };

      const data =
        postData.app_id + "|" + postData.app_trans_id + "|" + config.key1; // appid|app_trans_id|key1
      postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString(); // Tạo MAC

      // Cấu hình gửi POST request đến ZaloPay
      const postConfig = {
        method: "post",
        url: "https://sb-openapi.zalopay.vn/v2/query",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: qs.stringify(postData),
      };

      // Gửi request đến ZaloPay để kiểm tra trạng thái
      const result = await axios(postConfig);

      // Kiểm tra kết quả trả về từ ZaloPay
      if (result.data.return_code === 1) {
        // Thanh toán thành công
        return {
          success: true,
          return_code: result.data.return_code,
          message: "Payment successful",
          zp_trans_id: result.data.zp_trans_id, // ZaloPay transaction ID
        };
      } else {
        // Thanh toán không thành công hoặc đơn hàng chưa được xử lý
        return {
          success: false,
          return_code: result.data.return_code,
          message:
            result.data.return_code === 2
              ? "Payment failed"
              : "Payment is still processing",
          return_message: result.data.return_message,
        };
      }
    } catch (error) {
      throw new Error(error.message || "Failed to check order status");
    }
  }

  async checkPaymentStatusMomo(orderId) {
    try {
      if (!orderId) {
        throw new Error("orderId is required");
      }

      // Tạo chữ ký (signature)
      const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;
      const signature = crypto
        .createHmac("sha256", process.env.MOMO_SECRET_KEY)
        .update(rawSignature)
        .digest("hex");

      // Tạo body request
      const requestBody = {
        partnerCode: "MOMO",
        requestId: orderId,
        orderId,
        signature,
        lang: "vi",
      };

      // Gửi request đến Momo
      const options = {
        method: "POST",
        url: "https://test-payment.momo.vn/v2/gateway/api/query",
        headers: {
          "Content-Type": "application/json",
        },
        data: requestBody,
      };

      const response = await axios(options);

      // Trả về kết quả từ Momo
      return response.data;
    } catch (error) {
      throw new Error(
        error.message || "Failed to check payment status with Momo"
      );
    }
  }
}

module.exports = new OrderService();
