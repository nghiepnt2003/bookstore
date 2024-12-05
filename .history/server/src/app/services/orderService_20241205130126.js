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

  async getAllOrdersByUser({
    userId,
    filterQueries,
    limit,
    sort,
    page,
    fields,
  }) {
    try {
      // Format lại các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(filterQueries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      // Filtering (lọc theo trạng thái nếu có)
      if (filterQueries?.status) {
        formatedQueries.status = {
          $regex: filterQueries.status,
          $options: "i",
        };
      }

      // Tạo query command
      let queryCommand = Order.find({
        user: userId,
        ...formatedQueries,
      }).populate({
        path: "details",
        model: "OrderDetail",
      });

      // Sắp xếp
      if (sort) {
        const sortBy = sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Giới hạn trường trả về
      if (fields) {
        const selectedFields = fields.split(",").join(" ");
        queryCommand = queryCommand.select(selectedFields);
      }

      // Phân trang
      const currentPage = +page || 1;
      const perPage = +limit || process.env.LIMIT_ORDERS || 100;
      const skip = (currentPage - 1) * perPage;
      queryCommand.skip(skip).limit(perPage);

      // Lấy danh sách đơn hàng
      const response = await queryCommand.exec();

      // Lấy số lượng đơn hàng
      const counts = await Order.find({
        user: userId,
        ...formatedQueries,
      }).countDocuments();

      return { response, counts };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllOrdersByAdmin({ filterQueries, limit, sort, page, fields }) {
    try {
      // Format lại các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(filterQueries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      // Filtering (lọc theo trạng thái nếu có)
      if (filterQueries?.status) {
        formatedQueries.status = {
          $regex: filterQueries.status,
          $options: "i",
        };
      }

      // Tạo query command
      let queryCommand = Order.find({
        user: userId,
        ...formatedQueries,
      }).populate({
        path: "details",
        model: "OrderDetail",
      });

      // Sắp xếp
      if (sort) {
        const sortBy = sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Giới hạn trường trả về
      if (fields) {
        const selectedFields = fields.split(",").join(" ");
        queryCommand = queryCommand.select(selectedFields);
      }

      // Phân trang
      const currentPage = +page || 1;
      const perPage = +limit || process.env.LIMIT_ORDERS || 100;
      const skip = (currentPage - 1) * perPage;
      queryCommand.skip(skip).limit(perPage);

      // Lấy danh sách đơn hàng
      const response = await queryCommand.exec();

      // Lấy số lượng đơn hàng
      const counts = await Order.find({
        user: userId,
        ...formatedQueries,
      }).countDocuments();

      return { response, counts };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getOrdersByTimes(userId, query) {
    const { startTime, endTime, sort, fields, page, limit, ...filters } = query;

    if (!startTime || !endTime) {
      throw new Error("Please provide both startTime and endTime.");
    }

    // Convert startTime and endTime to Date objects
    const start = new Date(startTime);
    const end = new Date(new Date(endTime).setHours(23, 59, 59, 999));

    // Format filters for mongoose query
    let queryString = JSON.stringify(filters);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    );
    const formattedFilters = JSON.parse(queryString);

    // Add date range and status filter
    formattedFilters.date = { $gte: start, $lte: end };
    formattedFilters.status = "Successed";

    // Prepare mongoose query
    let queryCommand = Order.find({ ...formattedFilters }).populate({
      path: "details",
      model: "OrderDetail",
    });

    // Apply sorting
    if (sort) {
      const sortBy = sort.split(",").join(" ");
      queryCommand = queryCommand.sort(sortBy);
    }

    // Select specific fields
    if (fields) {
      const selectedFields = fields.split(",").join(" ");
      queryCommand = queryCommand.select(selectedFields);
    }

    // Pagination
    const pageNum = +page || 1;
    const pageLimit = +limit || process.env.LIMIT_ORDERS || 10;
    const skip = (pageNum - 1) * pageLimit;
    queryCommand = queryCommand.skip(skip).limit(pageLimit);

    // Execute query
    const orders = await queryCommand.exec();

    // Calculate total amount
    const totalAmount = orders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    // Count total matching documents
    const totalOrders = await Order.find({
      ...formattedFilters,
    }).countDocuments();

    return {
      orders,
      totalAmount,
      totalOrders,
    };
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

  async checkout({
    user,
    payment,
    shippingAddress,
    recipientName,
    recipientPhone,
  }) {
    if (!payment) throw new Error("Payment method not provided");
    if (!recipientName || !recipientPhone) throw new Error("Missing Inputs");

    const userInfo = await User.findById(user._id).select("address member");
    if (!userInfo.address || userInfo.address.length === 0) {
      throw new Error("User address is required for checkout");
    }

    const cart = await Cart.findOne({ user: user._id }).populate({
      path: "items",
      select: "selectedForCheckout quantity",
      populate: {
        path: "product",
        model: "Product",
        populate: { path: "categories" },
      },
    });

    if (!cart) throw new Error("Cart not found");
    const selectedItems = cart.items.filter(
      (item) => item.selectedForCheckout && !item.deleted
    );

    if (selectedItems.length === 0) {
      throw new Error("No items selected for checkout");
    }

    const orderDetailsIds = [];
    let totalPrice = 0;

    for (const item of selectedItems) {
      const product = await Product.findById(item.product._id);
      if (!product || product.stockQuantity < item.quantity) {
        throw new Error(
          `Product "${
            product?.name || "unknown"
          }" is sold out or insufficient stock.`
        );
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product._id, stockQuantity: { $gte: item.quantity } },
        { $inc: { stockQuantity: -item.quantity, soldCount: item.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        throw new Error(
          `Failed to update stock for product "${item.product.name}".`
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

    const member = await Member.findById(userInfo.member);
    if (member) {
      if (member.rank === "Silver") totalPrice *= 0.98;
      else if (member.rank === "Gold") totalPrice *= 0.95;
      else if (member.rank === "Diamond") totalPrice *= 0.9;
    }
    totalPrice = Math.round(totalPrice * 100) / 100;

    const orderStatus =
      payment === Payment.OFFLINE || payment === Payment.PAYPAL
        ? "Pending"
        : "Not Yet Paid";

    const newOrder = await Order.create({
      details: orderDetailsIds,
      recipientName,
      recipientPhone,
      date: new Date(),
      status: orderStatus,
      totalPrice,
      payment,
      user: user._id,
      shippingAddress,
    });

    const itemsToRemove = cart.items.filter((item) => item.selectedForCheckout);
    cart.items = cart.items.filter((item) => !item.selectedForCheckout);
    await cart.save();

    for (const item of selectedItems) {
      await adjustLineItemsQuantity(item.product._id);
    }

    for (const item of itemsToRemove) {
      await LineItem.findByIdAndDelete(item._id);
    }

    const uniqueOrderId = `${newOrder._id}-${Date.now()}`;

    if (payment === Payment.MOMO) {
      const momoResponse = await createMoMoOrder(
        user,
        totalPrice,
        uniqueOrderId
      );
      return { order: newOrder, momoResponse };
    } else if (payment === Payment.ZALOPAY) {
      const zaloPayResponse = await createZaloPayOrder(
        user,
        totalPrice,
        uniqueOrderId
      );
      return { order: newOrder, zaloPayResponse };
    } else {
      return { order: newOrder };
    }
  }

  async handleZaloPayCallback({ data, mac }, orderId) {
    // Tạo lại MAC để xác thực dữ liệu từ ZaloPay
    const generatedMac = CryptoJS.HmacSHA256(data, config.key2).toString();
    if (mac !== generatedMac) {
      throw new Error("MAC verification failed");
    }

    const dataJson = JSON.parse(data); // Chuyển đổi dữ liệu thành JSON
    console.log("Received payment data:", dataJson);

    const originalOrderId = orderId.split("-")[0];
    const order = await Order.findById(originalOrderId); // Tìm đơn hàng từ database

    if (!order) {
      throw new Error("Order not found");
    }

    // Cập nhật trạng thái đơn hàng
    order.status = "Pending"; // Cập nhật trạng thái đơn hàng thành Pending
    await order.save();
    console.log("Order updated:", order);

    return {
      success: true,
      message: "Payment successful, order status updated",
    };
  }

  async handleMoMoCallback(paymentData, orderId) {
    const { partnerCode, orderInfo, amount, requestId, resultCode } =
      paymentData;

    // Lấy mã đơn hàng gốc
    const originalOrderId = orderId.split("-")[0];
    console.log("Processing MoMo callback for order:", originalOrderId);

    // Kiểm tra kết quả thanh toán
    if (resultCode === 0) {
      // Thanh toán thành công
      const order = await Order.findById(originalOrderId);
      if (!order) {
        throw new Error("Order not found");
      }

      // Cập nhật trạng thái đơn hàng
      order.status = "Pending"; // Đánh dấu trạng thái đơn hàng là Pending
      await order.save();
      console.log("Order updated:", order);

      return {
        success: true,
        message: "Payment successful",
        order,
      };
    } else {
      // Thanh toán thất bại
      throw new Error("Payment failed");
    }
  }

  async updateOrderStatus(orderId, status) {
    const validStatuses = [
      "Not Yet Paid",
      "Pending",
      "Cancelled",
      "Transported",
      "Delivering",
      "Successed",
    ];

    if (!validStatuses.includes(status)) {
      throw new Error("Invalid order status");
    }

    const order = await Order.findById(orderId).populate({
      path: "details",
      model: "OrderDetail",
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Cập nhật trạng thái đơn hàng
    order.status = status;
    await order.save();

    if (status === "Successed") {
      const orderDetails = await OrderDetail.find({
        _id: { $in: order.details },
      });

      const totalQuantity = orderDetails.reduce(
        (acc, detail) => acc + detail.quantity,
        0
      );

      const user = await User.findById(order.user).populate("member");
      if (user && user.member) {
        user.member.score += 2 * totalQuantity; // Cộng điểm
        await user.member.save();
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

    return order;
  }

  async confirmOrder(orderId) {
    // Tìm đơn hàng
    const order = await Order.findById(orderId).populate({
      path: "details",
      model: "OrderDetail",
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.status !== "Transported") {
      throw new Error(
        "Only orders that are being Transported can be confirmed"
      );
    }

    // Cập nhật trạng thái thành "Successed"
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

    // Cộng điểm cho người dùng
    const user = await User.findById(order.user).populate("member");
    if (user && user.member) {
      user.member.score += 2 * totalQuantity; // 2 điểm cho mỗi sản phẩm
      await user.member.save();
    }

    return order;
  }

  /**
   * Xóa (hủy) đơn hàng của người dùng
   * @param {String} orderId - ID của đơn hàng
   * @param {String} userId - ID của người dùng
   */
  async deleteOrderByUser(orderId, userId) {
    // Tìm đơn hàng theo ID và user ID
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).populate({
      path: "details",
      model: "OrderDetail",
    });

    if (!order) {
      throw new Error("Order not found or cannot be deleted");
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.status !== "Pending" && order.status !== "Not Yet Paid") {
      throw new Error(
        "You can only cancel orders in Pending or Not Yet Paid status"
      );
    }

    // Hoàn lại số lượng tồn kho
    for (const detail of order.details) {
      const product = await Product.findOneAndUpdate(
        { _id: detail.productId },
        {
          $inc: {
            stockQuantity: detail.quantity, // Tăng tồn kho
            soldCount: -detail.quantity, // Giảm số lượng đã bán
          },
        },
        { new: true }
      );

      if (!product) {
        throw new Error(
          `Failed to update stock for product ID ${detail.productId}`
        );
      }
    }

    // Cập nhật trạng thái đơn hàng thành "Cancelled"
    order.status = "Cancelled";
    await order.save();

    return { success: true, message: "Order cancelled successfully" };
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
    callback_url: `https://7c16-116-102-198-219.ngrok-free.app/order/callbackZaloPay/${orderId}`,
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
  const ipnUrl = `https://7c16-116-102-198-219.ngrok-free.app/order/callbackMomo/${orderId}`;
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
module.exports = new OrderService();
