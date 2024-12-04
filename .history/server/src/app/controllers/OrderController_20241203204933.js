const Cart = require("../models/Cart");
const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
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
const orderService = require("../services/orderService");

async function generateMoMoQR(phone, price) {
  const text = `2|99|${phone}|||||${price}`;

  try {
    const url = await QRCode.toDataURL(text, {
      color: {
        dark: "#000", // Màu của mã QR (đen)
        light: "#FFF", // Màu nền (trắng)
      },
    });
    QRCode.toString(text, { type: "terminal" }, function (err, string) {
      if (err) throw err;
      console.log("QR code ASCII:");
      console.log(string);
    });
    return url;
  } catch (err) {
    throw err;
  }
}

class OrderController {
  // [GET] /order/:id
  async getById(req, res) {
    try {
      const { id: orderId } = req.params;
      const userId = req.user._id;

      // Gọi phương thức từ OrderService
      const result = await orderService.getOrderById(orderId, userId);

      // Trả về kết quả
      if (!result.success) {
        return res.status(result.order ? 403 : 500).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
  // [GET] /order/getAllsByUser
  async getAllsByUser(req, res) {
    try {
      const { _id: userId } = req.user;
      const queryParams = req.query;

      // Gọi service để xử lý logic
      const result = await orderService.getAllOrdersByUser(userId, queryParams);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //[GET] /order/getAll
  async getAllByAdmin(req, res) {
    try {
      const queryParams = req.query;

      // Gọi service để xử lý logic
      const result = await orderService.getAllOrdersByAdmin(queryParams);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /order/byTime
  //GET /order/byTime?startTime=2023-01-01&endTime=2023-01-31
  async getOrdersByTimes(req, res) {
    try {
      const { _id: userId } = req.user; // Extract user ID from the authenticated request
      const query = req.query;

      // Fetch orders using the service
      const { orders, totalAmount, totalOrders } =
        await orderService.getOrdersByTimes(userId, query);

      res.status(200).json({
        success: orders.length > 0,
        counts: totalOrders,
        totalAmount,
        orders:
          orders.length > 0
            ? orders
            : "No successful orders found in the specified time range",
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // async getOrdersByTimes(req, res) {
  //   try {
  //     const { _id } = req.user; // Lấy user ID từ access token (phải có middleware xác thực trước đó)

  //     // Lấy startTime và endTime từ query params
  //     const { startTime, endTime } = req.query;

  //     // Kiểm tra nếu startTime hoặc endTime không được cung cấp
  //     if (!startTime || !endTime) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Please provide both startTime and endTime.",
  //       });
  //     }

  //     // Chuyển đổi startTime và endTime thành kiểu Date
  //     const start = new Date(startTime);
  //     const end = new Date(new Date(endTime).setHours(23, 59, 59, 999)); // Đặt thời gian cuối ngày

  //     // Lấy các query parameters
  //     const queries = { ...req.query };
  //     const excludeFields = [
  //       "limit",
  //       "sort",
  //       "page",
  //       "fields",
  //       "startTime",
  //       "endTime",
  //     ];
  //     excludeFields.forEach((el) => delete queries[el]);

  //     // Format lại các operators cho đúng cú pháp mongoose
  //     let queryString = JSON.stringify(queries);
  //     queryString = queryString.replace(
  //       /\b(gte|gt|lt|lte)\b/g,
  //       (matchedEl) => `$${matchedEl}`
  //     );
  //     const formatedQueries = JSON.parse(queryString);

  //     // Thêm điều kiện thời gian và trạng thái Successed vào formatedQueries
  //     formatedQueries.date = { $gte: start, $lte: end };
  //     formatedQueries.status = "Successed";

  //     // Tìm các đơn hàng trong khoảng thời gian đã chỉ định và thuộc về người dùng
  //     let queryCommand = Order.find({ ...formatedQueries }).populate({
  //       path: "details",
  //       model: "OrderDetail",
  //     });

  //     // Sắp xếp nếu có tham số sort
  //     if (req.query.sort) {
  //       const sortBy = req.query.sort.split(",").join(" ");
  //       queryCommand = queryCommand.sort(sortBy);
  //     }

  //     // Lọc các trường cần thiết nếu có tham số fields
  //     if (req.query.fields) {
  //       const fields = req.query.fields.split(",").join(" ");
  //       queryCommand = queryCommand.select(fields);
  //     }

  //     // Phân trang
  //     const page = +req.query.page || 1;
  //     const limit = +req.query.limit || process.env.LIMIT_ORDERS || 10; // Giới hạn số lượng đơn hàng trên mỗi trang
  //     const skip = (page - 1) * limit;
  //     queryCommand.skip(skip).limit(limit);

  //     // Thực thi query
  //     const response = await queryCommand.exec();

  //     // Tính tổng tiền của các đơn hàng tìm được
  //     const totalAmount = response.reduce(
  //       (sum, order) => sum + order.totalPrice,
  //       0
  //     );

  //     // Lấy số lượng đơn hàng
  //     const counts = await Order.find({
  //       ...formatedQueries,
  //     }).countDocuments();

  //     res.status(200).json({
  //       success: response.length > 0,
  //       counts,
  //       totalAmount,
  //       orders:
  //         response.length > 0
  //           ? response
  //           : "No successful orders found in the specified time range",
  //     });
  //   } catch (error) {
  //     res.status(500).json({ success: false, message: error.message });
  //   }
  // }

  //[GET] /order/checkOrderStatus

  async checkOrderStatus(req, res) {
    const { orderId } = req.params;

    try {
      // Lấy thông tin đơn hàng từ cơ sở dữ liệu
      const order = await Order.findById(orderId);

      // Kiểm tra xem đơn hàng có tồn tại không
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }
      // Kiểm tra xem đơn hàng có thuộc về người dùng hiện tại không
      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied: This order does not belong to you.",
        });
      }

      // Kiểm tra trạng thái của đơn hàng
      if (order.status === "Pending") {
        return res.json({ success: true, message: "Order is pending" });
      } else {
        return res.json({
          success: false,
          message: `Order ${order.status}`,
        });
      }
    } catch (error) {
      // Xử lý lỗi
      return res.status(500).json({
        success: false,
        message: "Error retrieving order status",
        error: error.message,
      });
    }
  }

  //[GET] /order/check-status-zalopay
  async checkPaymentStatusZaloPay(req, res) {
    const { app_trans_id } = req.body;

    try {
      // Gọi service để kiểm tra trạng thái thanh toán
      const result = await orderService.checkPaymentStatusZaloPay(app_trans_id);

      if (result.success) {
        // Nếu thanh toán thành công
        return res.status(200).json(result);
      } else {
        // Nếu thanh toán không thành công hoặc đang xử lý
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  //[GET] /order/check-status-momo
  async checkPaymentStatusMomo(req, res) {
    const { orderId } = req.body;

    try {
      // Gọi service để xử lý logic
      const result = await orderService.checkPaymentStatusMomo(orderId);

      // Trả về kết quả
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // [POST] /order/checkout
  async checkout(req, res) {
    try {
      const user = req.user;
      const { payment, shippingAddress, recipientName, recipientPhone } =
        req.body;

      const { order, momoResponse, zaloPayResponse } =
        await orderService.checkout({
          user,
          payment,
          shippingAddress,
          recipientName,
          recipientPhone,
        });

      if (momoResponse) {
        if (momoResponse.success && momoResponse.data.resultCode === 0) {
          return res.status(200).json({
            success: true,
            message: "Checkout successful with MoMo",
            order,
            momoData: momoResponse.data,
          });
        }
        return res.status(500).json({
          success: false,
          message: "MoMo payment initialization failed",
          error: momoResponse.error,
        });
      }

      if (zaloPayResponse) {
        if (
          zaloPayResponse.success &&
          zaloPayResponse.zalopayData.return_code === 1
        ) {
          return res.status(200).json({
            success: true,
            message: "Checkout successful with ZaloPay",
            order,
            zaloPayResult: zaloPayResponse.zalopayData,
            payment_id: zaloPayResponse.payment_id,
          });
        }
        return res.status(500).json({
          success: false,
          message: "ZaloPay payment initialization failed",
          error: zaloPayResponse.zalopayData.message || "Unknown error",
        });
      }

      res.status(200).json({
        success: true,
        message: "Checkout successful",
        order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Checkout failed",
        error: error.message,
      });
    }
  }
  // [POST] /order/callbackZaloPay/:orderId
  async callbackZaloPay(req, res) {
    try {
      const { data, mac } = req.body;
      const { orderId } = req.params;

      const result = await orderService.handleZaloPayCallback(
        { data, mac },
        orderId
      );

      res.json(result);
    } catch (error) {
      console.error("Error:", error.message);
      res.json({
        success: false,
        message: error.message,
      });
    }
  }
  // [POST] /order/callbackMomo/:orderId
  async callbackMomo(req, res) {
    const { orderId } = req.params;
    const paymentData = req.body;

    try {
      const result = await orderService.handleMoMoCallback(
        paymentData,
        orderId
      );
      res.status(200).json(result);
    } catch (error) {
      console.error("MoMo Callback Error:", error.message);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  //[PUT] /order/confirmQRcode/:orderId
  // API xác nhận quét mã QR
  async confirmQRCodeScan(req, res) {
    try {
      const { orderId } = req.params;

      // Tìm đơn hàng dựa trên orderId
      const order = await Order.findById(orderId);
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }
      // Kiểm tra xem đơn hàng có thuộc về người dùng hiện tại không
      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied: This order does not belong to you.",
        });
      }

      // Kiểm tra trạng thái đơn hàng có thể chuyển sang Pending không
      if (order.payment !== Payment.MOMO || order.status !== "Not Yet Paid") {
        return res.status(400).json({
          success: false,
          message: "Payment confirmation is not applicable",
        });
      }

      // Cập nhật trạng thái đơn hàng sang Pending
      order.status = "Pending";
      await order.save();

      res.status(200).json({
        success: true,
        message: "Payment successfully, order status updated to Pending",
        order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update order status",
        error: error.message,
      });
    }
  }

  // [PUT] /order/updateStatus/:id
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await orderService.updateOrderStatus(id, status);

      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // [PUT] /order/confirmOrder/:id
  async confirmOrder(req, res) {
    try {
      const { id } = req.params;

      const order = await orderService.confirmOrder(id);

      res.status(200).json({
        success: true,
        message: "Order confirmed and status updated to Successed",
        order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error confirming order",
        error: error.message,
      });
    }
  }

  // [DELETE] /order/:id
  async deleteByUser(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id; // Lấy user ID từ access token

      const result = await orderService.deleteOrderByUser(id, userId);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to cancel order",
        error: error.message,
      });
    }
  }
}

// Out of controller

module.exports = new OrderController();
