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
const config = {
  app_id: "2554" || process.env.ZALO_APP_IP,
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn" || process.env.ZALO_KEY1,
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf" || process.env.ZALO_KEY2,
  endpoint:
    "https://sb-openapi.zalopay.vn/v2/create" || process.env.ZALO_ENDPOINT,
};
async function createZaloPayOrder(user, totalPrice, orderId) {
  const zalopayOrder = {
    app_id: config.app_id,
    app_trans_id: `${moment().format("YYMMDD")}_${Math.floor(
      Math.random() * 1000000
    )}`,
    app_user: "Book Store",
    app_time: Date.now(),
    amount: totalPrice,
    item: JSON.stringify([]),
    embed_data: JSON.stringify({}),
    // embed_data: JSON.stringify({
    //   redirecturl: "https://your-redirect-url.com",
    // }),
    callback_url: `https://af0b-27-77-75-170.ngrok-free.app/order/callbackZaloPay/${orderId}`,
    description: `Payment for order #${orderId}`,
  };

  const data = `${config.app_id}|${zalopayOrder.app_trans_id}|${zalopayOrder.app_user}|${zalopayOrder.amount}|${zalopayOrder.app_time}|${zalopayOrder.embed_data}|${zalopayOrder.item}`;
  zalopayOrder.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
  console.log(data);
  try {
    const zalopayResponse = await axios.post(config.endpoint, null, {
      params: zalopayOrder,
    });
    return {
      success: true,
      zalopayData: zalopayResponse.data,
      payment_id: zalopayOrder.app_trans_id,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function createMoMoOrder(user, totalPrice, orderId) {
  // const secretKey =
  //   process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  // const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";

  const accessKey = "F8BBA842ECF85";
  const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  const partnerCode = "MOMO";
  const redirectUrl =
    "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b";
  const ipnUrl = `https://8037-27-77-75-170.ngrok-free.app/order/callbackMomo/${orderId}`;
  const requestType = "payWithMethod";
  const amount = totalPrice.toString();
  const orderInfo = "Payment for Order #" + orderId;
  const requestId = partnerCode + new Date().getTime();
  const extraData = "";
  const autoCapture = true;
  const lang = "vi";

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = {
    partnerCode: partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: lang,
    requestType: requestType,
    autoCapture: autoCapture,
    extraData: extraData,
    signature: signature,
  };

  try {
    const response = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("MoMo payment initialization error:", error.message);
    return {
      success: false,
      error: error.message,
    };
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
      const { _id } = req.user; // Lấy user ID từ access token (phải có middleware xác thực trước đó)

      // Lấy startTime và endTime từ query params
      const { startTime, endTime } = req.query;

      // Kiểm tra nếu startTime hoặc endTime không được cung cấp
      if (!startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: "Please provide both startTime and endTime.",
        });
      }

      // Chuyển đổi startTime và endTime thành kiểu Date
      const start = new Date(startTime);
      const end = new Date(new Date(endTime).setHours(23, 59, 59, 999)); // Đặt thời gian cuối ngày

      // Lấy các query parameters
      const queries = { ...req.query };
      const excludeFields = [
        "limit",
        "sort",
        "page",
        "fields",
        "startTime",
        "endTime",
      ];
      excludeFields.forEach((el) => delete queries[el]);

      // Format lại các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(queries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      // Thêm điều kiện thời gian và trạng thái Successed vào formatedQueries
      formatedQueries.date = { $gte: start, $lte: end };
      formatedQueries.status = "Successed";

      // Tìm các đơn hàng trong khoảng thời gian đã chỉ định và thuộc về người dùng
      let queryCommand = Order.find({ ...formatedQueries }).populate({
        path: "details",
        model: "OrderDetail",
      });

      // Sắp xếp nếu có tham số sort
      if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Lọc các trường cần thiết nếu có tham số fields
      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      // Phân trang
      const page = +req.query.page || 1;
      const limit = +req.query.limit || process.env.LIMIT_ORDERS || 10; // Giới hạn số lượng đơn hàng trên mỗi trang
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      // Thực thi query
      const response = await queryCommand.exec();

      // Tính tổng tiền của các đơn hàng tìm được
      const totalAmount = response.reduce(
        (sum, order) => sum + order.totalPrice,
        0
      );

      // Lấy số lượng đơn hàng
      const counts = await Order.find({
        ...formatedQueries,
      }).countDocuments();

      res.status(200).json({
        success: response.length > 0,
        counts,
        totalAmount,
        orders:
          response.length > 0
            ? response
            : "No successful orders found in the specified time range",
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

    // Kiểm tra nếu app_trans_id không có trong request
    if (!app_trans_id) {
      return res.status(400).json({
        success: false,
        message: "app_trans_id is required",
      });
    }

    // Tạo dữ liệu để gửi đến ZaloPay
    let postData = {
      app_id: config.app_id,
      app_trans_id, // Input your app_trans_id
    };

    let data =
      postData.app_id + "|" + postData.app_trans_id + "|" + config.key1; // appid|app_trans_id|key1
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString(); // Tạo MAC

    // Cấu hình gửi POST request đến ZaloPay
    let postConfig = {
      method: "post",
      url: "https://sb-openapi.zalopay.vn/v2/query",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify(postData), // Mã hóa dữ liệu dạng x-www-form-urlencoded
    };

    try {
      // Gửi request đến ZaloPay để kiểm tra trạng thái
      const result = await axios(postConfig);
      console.log(result.data); // Kiểm tra kết quả trả về từ ZaloPay

      // Kiểm tra kết quả trả về từ ZaloPay
      if (result.data.return_code === 1) {
        // Thanh toán thành công
        return res.status(200).json({
          success: true,
          return_code: result.data.return_code,
          message: "Payment successful",
          zp_trans_id: result.data.zp_trans_id, // ZaloPay transaction ID
        });
      } else {
        // Thanh toán không thành công hoặc đơn hàng chưa được xử lý
        return res.status(400).json({
          success: false,
          return_code: result.data.return_code,
          message:
            result.data.return_code === 2
              ? "Payment failed"
              : "Payment is still processing",
          return_message: result.data.return_message,
        });
      }
    } catch (error) {
      console.log("Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to check order status",
        error: error.message,
      });
    }
  }

  //[GET] /order/check-status-momo
  async checkPaymentStatusMomo(req, res) {
    const { orderId } = req.body;
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;
    const signature = crypto
      .createHmac("sha256", process.env.MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest("hex");
    const requestBody = JSON.stringify({
      partnerCode: "MOMO",
      requestId: orderId,
      orderId,
      signature,
      lang: "vi",
    });
    const options = {
      method: "POST",
      url: "https://test-payment.momo.vn/v2/gateway/api/query",
      headers: {
        "Content-Type": "application/json",
      },
      data: requestBody,
    };
    let result = await axios(options);

    return res.status(200).json(result.data);
  }

  // [POST] /order/checkout
  async checkout(req, res) {
    try {
      const user = req.user; // Lấy thông tin user từ accessToken
      // const payment = req.body.payment;
      // const shippingAddress = req.body.shippingAddress; // Nhận địa chỉ giao hàng từ request
      const { payment, shippingAddress, recipientName, recipientPhone } =
        req.body; // Lấy phương thức thanh toán và địa chỉ giao hàng từ yêu cầu

      if (!payment) {
        return res
          .status(400)
          .json({ success: false, message: "Payment method not provided" });
      }
      if (!recipientName || !recipientPhone) {
        return res
          .status(400)
          .json({ success: false, message: "Missing Inputs" });
      }
      // Kiểm tra xem người dùng có địa chỉ hay không
      const userInfo = await User.findById(user._id).select("address member");

      if (!userInfo.address || userInfo.address.length === 0) {
        return res.status(400).json({
          success: false,
          message: "User address is required for checkout",
        });
      }
      // Kiểm tra xem địa chỉ giao hàng có nằm trong danh sách địa chỉ của người dùng không
      // if (!userInfo.address.includes(shippingAddress)) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Invalid shipping address",
      //   });
      // }

      let cart = await Cart.findOne({ user: user._id }).populate({
        path: "items",
        select: "selectedForCheckout quantity",
        populate: {
          path: "product",
          model: "Product",
          populate: { path: "categories" },
        },
      });

      if (!cart) {
        return res
          .status(400)
          .json({ success: false, message: "Cart not found" });
      }

      const selectedItems = cart.items.filter(
        (item) => item.selectedForCheckout && !item.deleted
      );

      if (selectedItems.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No items selected for checkout" });
      }

      // Mảng lưu trữ các _id của OrderDetail đã lưu
      const orderDetailsIds = [];
      let totalPrice = 0; // Biến để lưu tổng giá trị đơn hàng
      // Kiểm tra và cập nhật tồn kho
      for (const item of selectedItems) {
        // Kiểm tra tồn kho trước khi cập nhật
        const product = await Product.findById(item.product._id);

        if (!product || product.stockQuantity < item.quantity) {
          throw new Error(
            `Product "${
              product?.name || "unknown"
            }" is sold out or insufficient stock.`
          );
        }

        // Cập nhật tồn kho và số lượng đã bán
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.product._id,
            stockQuantity: { $gte: item.quantity },
          },
          {
            $inc: {
              stockQuantity: -item.quantity,
              soldCount: item.quantity,
            },
          },
          { new: true }
        );

        if (!updatedProduct) {
          throw new Error(
            `Failed to update stock for product "${item.product.name}". Please try again.`
          );
        }

        const finalPrice = await updatedProduct.getFinalPrice();

        const orderDetail = new OrderDetail({
          productId: updatedProduct._id,
          productName: updatedProduct.name,
          productImage: updatedProduct.image,
          productPrice: finalPrice,
          quantity: item.quantity,
        });

        const savedOrderDetail = await orderDetail.save();
        orderDetailsIds.push(savedOrderDetail._id);
        totalPrice += finalPrice * item.quantity;
      }
      // Kiểm tra rank của user để áp dụng giảm giá
      const member = await Member.findById(userInfo.member);
      console.log(member);
      if (member) {
        if (member.rank === "Silver") {
          totalPrice *= 0.98; // Giảm 2%
        } else if (member.rank === "Gold") {
          totalPrice *= 0.95; // Giảm 5%
        } else if (member.rank === "Diamond") {
          totalPrice *= 0.9; // Giảm 10%
        }
      }
      totalPrice = Math.round(totalPrice * 100) / 100;

      const orderStatus =
        payment === Payment.OFFLINE || payment === Payment.PAYPAL
          ? "Pending"
          : "Not Yet Paid";

      // Tạo đơn hàng mới với thông tin chi tiết đã tạo
      const newOrder = await Order.create({
        details: orderDetailsIds,
        recipientName: recipientName,
        recipientPhone,
        date: new Date(),
        status: orderStatus,
        totalPrice: totalPrice, // Tổng giá trị sau khi áp dụng giảm giá
        payment: payment, // Phương thức thanh toán
        user: user._id,
        shippingAddress: shippingAddress,
      });

      // Xóa các item đã checkout khỏi giỏ hàng
      const itemsToRemove = cart.items.filter(
        (item) => item.selectedForCheckout
      );
      cart.items = cart.items.filter((item) => !item.selectedForCheckout);
      await cart.save();

      // Gọi hàm điều chỉnh số lượng sản phẩm trong LineItem của tất cả người dùng sau khi cập nhật tồn kho
      for (const item of selectedItems) {
        await adjustLineItemsQuantity(item.product._id);
      }

      // Xóa các LineItem tương ứng khỏi cơ sở dữ liệu
      for (const item of itemsToRemove) {
        await LineItem.findByIdAndDelete(item._id);
      }

      const uniqueOrderId = `${newOrder._id}-${Date.now()}`;
      if (payment === Payment.MOMO) {
        try {
          const momoResponse = await createMoMoOrder(
            user,
            totalPrice,
            // newOrder._id
            uniqueOrderId
          );
          if (momoResponse.success && momoResponse.data.resultCode === 0) {
            res.status(200).json({
              success: true,
              message: "Checkout successful with MoMo",
              order: newOrder,
              momoData: momoResponse.data,
            });
          } else {
            res.status(500).json({
              success: false,
              message: "MoMo payment initialization failed",
              error: momoResponse.error,
            });
          }
        } catch (error) {
          res.status(500).json({
            success: false,
            message: "Unexpected error during MoMo payment",
            error: error.message,
          });
        }
      } else if (payment === Payment.ZALOPAY) {
        const zaloPayResponse = await createZaloPayOrder(
          user,
          totalPrice,
          // newOrder._id
          uniqueOrderId
        );

        if (
          zaloPayResponse.success &&
          zaloPayResponse.zalopayData.return_code === 1
        ) {
          res.status(200).json({
            success: true,
            message: "Checkout successful with zalo",
            order: newOrder,
            zalopayResult: zaloPayResponse.zalopayData,
            payment_id: zaloPayResponse.payment_id,
          });
        } else {
          res.status(500).json({
            success: false,
            message: "ZaloPay payment initialization failed",
            error: zaloPayResponse.zalopayData.message || "Unknown error",
          });
        }
      } else {
        res.status(200).json({
          success: true,
          message: "Checkout successful",
          order: newOrder,
        });
      }
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
async function adjustLineItemsQuantity(productId) {
  // Tìm tất cả các giỏ hàng
  const carts = await Cart.find().populate({
    path: "items",
    populate: {
      path: "product",
      model: "Product",
    },
  });

  for (const cart of carts) {
    for (const item of cart.items) {
      if (item.product._id.toString() === productId.toString()) {
        const product = item.product;

        if (product.stockQuantity === 0) {
          // Nếu sản phẩm hết hàng, xóa LineItem
          await LineItem.findByIdAndDelete(item._id);

          // Loại bỏ LineItem khỏi giỏ hàng
          cart.items = cart.items.filter(
            (lineItem) => lineItem._id.toString() !== item._id.toString()
          );
        } else if (product.stockQuantity < item.quantity) {
          // Điều chỉnh số lượng nếu tồn kho không đủ
          item.quantity = product.stockQuantity;
          await item.save();
        }
      }
    }

    // Lưu lại giỏ hàng sau khi đã cập nhật
    await cart.save();
  }
}

module.exports = new OrderController();
