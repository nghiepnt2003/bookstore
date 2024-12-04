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
      const userId = req.user._id;
      const queryParams = req.query;

      // Gọi service để xử lý logic
      const result = await orderService.getOrdersByTimeRange(
        userId,
        queryParams
      );

      res.status(200).json(result);
    } catch (error) {
      if (error.message === "Please provide both startTime and endTime.") {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: error.message });
      }
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

  // [POST] /order/checkout
  async checkout(req, res) {
    try {
      const user = req.user;
      const { payment, shippingAddress, recipientName, recipientPhone } =
        req.body;

      const { order, momoResponse, zaloPayResponse } =
        await OrderService.checkout({
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
    let result = {};
    console.log(req.body);
    try {
      let dataStr = req.body.data; // Dữ liệu từ ZaloPay
      let reqMac = req.body.mac; // mac từ ZaloPay
      // Tạo lại MAC để xác thực dữ liệu từ ZaloPay
      const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
      console.log("Generated MAC =", mac);

      // Kiểm tra xem MAC có hợp lệ không
      if (reqMac !== mac) {
        result.success = false; // MAC không hợp lệ
        result.message = "MAC verification failed";
        return res.json(result);
      } else {
        // Nếu MAC hợp lệ, xử lý thanh toán
        const dataJson = JSON.parse(dataStr); // Chuyển đổi dữ liệu thành JSON
        console.log("Received payment data:", dataJson);
        // Thanh toán thành công
        const { orderId } = req.params;
        const originalOrderId = orderId.split("-")[0];
        const order = await Order.findById(originalOrderId); // Tìm đơn hàng từ database

        if (!order) {
          result.success = false;
          result.message = "Order not found";
          return res.json(result);
        }

        // Cập nhật trạng thái đơn hàng
        order.status = "Pending"; // Cập nhật trạng thái đơn hàng thành Pending
        await order.save();
        console.log("orderUpdated : ", order);

        result.success = true;
        result.message = "Payment successful, order status updated";
      }
    } catch (error) {
      console.error("Error:", error.message);
      result.success = false; // Trả lại kết quả lỗi
      result.message = error.message;
    }

    // Trả kết quả cho ZaloPay server
    res.json(result);
  }
  // [POST] /order/callbackMomo/:orderId
  async callbackMomo(req, res) {
    const { orderId } = req.params;
    const originalOrderId = orderId.split("-")[0];
    console.log("callback momo : ", originalOrderId);
    const {
      partnerCode,
      orderInfo,
      amount,
      // orderId: orderId,
      requestId,
      resultCode,
      signature,
    } = req.body;
    // const secretKey =
    //   process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    // const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
    // const redirectUrl =
    //   process.env.MOMO_REDIRECT_URL || "https://webhook.site/your-redirect-url";
    // const requestType = "payWithMethod";

    // const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    // // Validate signature
    // const expectedSignature = crypto
    //   .createHmac("sha256", secretKey)
    //   .update(rawSignature)
    //   .digest("hex");

    // if (signature !== expectedSignature) {
    //   console.log("Invalid signature");
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Invalid signature" });
    // }

    // Check if the payment was successful
    if (resultCode === 0) {
      // Payment successful, proceed with updating the order status in your database
      try {
        // Assume you have a function `updateOrderStatus` to handle the order update
        const order = await Order.findById(originalOrderId);
        if (!order) {
          return res.status(404).json({
            success: false,
            message: "Order not found",
          });
        }
        order.status = "Pending"; // Cập nhật trạng thái đơn hàng thành Pending
        await order.save();
        console.log("orderUpdated : ", order);
        return res.status(200).json({
          success: true,
          message: "Payment successful",
          order,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Error updating order status",
          error: error.message,
        });
      }
    } else {
      // Payment failed, handle the failure case
      return res.status(400).json({
        success: false,
        message: "Payment failed",
        responseCode,
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
      const { status } = req.body; // Lấy trạng thái mới từ request body

      // Kiểm tra trạng thái mới có hợp lệ không
      const validStatuses = [
        "Not Yet Paid",
        "Pending",
        "Cancelled",
        "Transported",
        "Delivering",
        "Successed",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      // Tìm đơn hàng theo ID
      const order = await Order.findById(id).populate({
        path: "details", // Populate trường "details"
        model: "OrderDetail", // Tên của model "OrderDetail"
      });
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Cập nhật trạng thái đơn hàng
      order.status = status;
      await order.save();

      if (status === "Successed") {
        // Tìm tất cả các orderDetails liên quan đến order này
        const orderDetails = await OrderDetail.find({
          _id: { $in: order.details },
        });

        // Tính tổng số lượng sản phẩm
        const totalQuantity = orderDetails.reduce(
          (acc, detail) => acc + detail.quantity,
          0
        );
        const user = await User.findById(order.user).populate("member");
        if (user && user.member) {
          user.member.score += 2 * totalQuantity; // Cộng thêm 2 điểm
          await user.member.save(); // Lưu thay đổi vào Member
        }
      }
      if (status === "Cancelled") {
        for (const detail of order.details) {
          await Product.findOneAndUpdate(
            { _id: detail.productId },
            {
              $inc: {
                stockQuantity: detail.quantity,
                soldCount: -detail.quantity,
              },
            },
            { new: true }
          );
        }
      }

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

      // Tìm đơn hàng theo ID
      const order = await Order.findById(id).populate({
        path: "details", // Populate trường "details"
        model: "OrderDetail", // Tên của model "OrderDetail"
      });

      // Kiểm tra nếu không tìm thấy đơn hàng
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Kiểm tra nếu trạng thái hiện tại không phải là "Transported"
      if (order.status !== "Transported") {
        return res.status(400).json({
          success: false,
          message: "Only orders that are being Transported can be confirmed",
        });
      }

      // Cập nhật trạng thái đơn hàng thành "Successed"
      order.status = "Successed";
      await order.save();

      // Tính tổng số lượng sản phẩm trong đơn hàng
      const orderDetails = await OrderDetail.find({
        _id: { $in: order.details },
      });
      const totalQuantity = orderDetails.reduce(
        (acc, detail) => acc + detail.quantity,
        0
      );

      // Cộng điểm cho người dùng (2 điểm cho mỗi sản phẩm trong đơn hàng)
      const user = await User.findById(order.user).populate("member");
      if (user && user.member) {
        user.member.score += 2 * totalQuantity; // Cộng thêm 2 điểm cho mỗi sản phẩm
        await user.member.save(); // Lưu thay đổi vào Member
      }

      // Gửi phản hồi thành công
      res.status(200).json({
        success: true,
        message: "Order confirmed and status updated to Successed",
        order,
      });
    } catch (error) {
      // Xử lý lỗi
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

      // Tìm đơn hàng theo ID và kiểm tra xem nó có thuộc về người dùng không
      const order = await Order.findOne({
        _id: id,
        user: userId,
      }).populate({
        path: "details", // Populate trường "details"
        model: "OrderDetail", // Tên của model "OrderDetail"
      });
      // Kiểm tra trạng thái của đơn hàng
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found or cannot be deleted",
        });
      }

      if (order.status !== "Pending" && order.status !== "Not Yet Paid") {
        return res.status(400).json({
          success: false,
          message:
            "You cannot cancel this order because you can only cancel orders in pending or not paid yet status",
        });
      }

      // Hoàn lại số lượng tồn kho
      for (const detail of order.details) {
        console.log(detail);

        const product = await Product.findOneAndUpdate(
          { _id: detail.productId }, // Tìm sản phẩm
          {
            $inc: {
              stockQuantity: detail.quantity, // Tăng số lượng tồn kho
              soldCount: -detail.quantity, // Giảm số lượng đã bán
            },
          },
          { new: true } // Trả về bản ghi đã cập nhật
        );

        if (!product) {
          return res.status(500).json({
            success: false,
            message: `Failed to update stock for product with ID ${detail.productId}`,
          });
        }
      }

      // Cập nhật trạng thái đơn hàng thành "Cancelled"
      order.status = "Cancelled";
      await order.save();

      res
        .status(200)
        .json({ success: true, message: "Order cancelled successfully" });
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
