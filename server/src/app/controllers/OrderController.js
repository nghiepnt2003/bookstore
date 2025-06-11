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
      const { _id: userId } = req.user; // Lấy user ID từ access token (middleware xác thực trước đó)
      const queries = { ...req.query };

      // Tách các giá trị đặc biệt
      const { limit, sort, page, fields, ...filterQueries } = queries;

      // Gọi service để lấy dữ liệu
      const { response, counts } = await orderService.getAllOrdersByUser({
        userId,
        filterQueries,
        limit,
        sort,
        page,
        fields,
      });

      res.status(200).json({
        success: response.length > 0,
        counts,
        orders:
          response.length > 0 ? response : "No orders found for this user",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //[GET] /order/getAll
  async getAllByAdmin(req, res) {
    try {
      const queries = { ...req.query };

      // Tách các giá trị đặc biệt
      const { limit, sort, page, fields, ...filterQueries } = queries;

      // Gọi service để lấy dữ liệu
      const { response, counts } = await orderService.getAllOrdersByAdmin({
        filterQueries,
        limit,
        sort,
        page,
        fields,
      });

      res.status(200).json({
        success: response.length > 0,
        counts,
        orders: response.length > 0 ? response : "Cannot get orders",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /order/byTime
  //GET /order/byTime?startTime=2023-01-01&endTime=2023-01-31
  async getOrdersByTimes(req, res) {
    try {
      const { _id } = req.user; // Lấy user ID từ access token (middleware xác thực)
      const { startTime, endTime, ...queryParams } = req.query;

      // Kiểm tra nếu startTime hoặc endTime không được cung cấp
      if (!startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: "Please provide both startTime and endTime.",
        });
      }

      // Gọi service để xử lý
      const { success, counts, totalAmount, orders, message } =
        await orderService.getOrdersByTimes(startTime, endTime, queryParams);

      res.status(success ? 200 : 404).json({
        success,
        counts,
        totalAmount,
        orders,
        message,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

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

  // [GET] /order/payment-url/:id
  async getMoMoPaymentUrl(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const momoResponse = await orderService.getMoMoPaymentUrl(id, user);

      if (!momoResponse.success) {
        return res.status(400).json({
          success: false,
          message: momoResponse.message,
          error: momoResponse.error,
        });
      }

      return res.status(200).json({
        success: true,
        message: "MoMo payment URL retrieved successfully",
        paymentUrl: momoResponse.data.payUrl,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve MoMo payment URL",
        error: error.message,
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
      const userId = req.user._id;
      const user = await User.findById(userId).select("email");

      const order = await orderService.confirmOrder(id, user.email);

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
