const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const LineItem = require("../models/LineItem");
const User = require("../models/User");
const { Payment } = require("../models/Payment");
const QRCode = require("qrcode");
// const Member = require("../models/Member");
const qs = require("qs");
const moment = require("moment");
const CryptoJS = require("crypto-js");
const axios = require("axios");
const crypto = require("crypto");
const mongoose = require("mongoose");
const sendMail = require("../../util/sendMail");

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
        ...formatedQueries,
      }).countDocuments();

      return { response, counts };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // async getOrdersByTimes(userId, query) {
  //   const { startTime, endTime, sort, fields, page, limit, ...filters } = query;

  //   if (!startTime || !endTime) {
  //     throw new Error("Please provide both startTime and endTime.");
  //   }

  //   // Convert startTime and endTime to Date objects
  //   const start = new Date(startTime);
  //   const end = new Date(new Date(endTime).setHours(23, 59, 59, 999));

  //   // Format filters for mongoose query
  //   let queryString = JSON.stringify(filters);
  //   queryString = queryString.replace(
  //     /\b(gte|gt|lt|lte)\b/g,
  //     (match) => `$${match}`
  //   );
  //   const formattedFilters = JSON.parse(queryString);

  //   // Add date range and status filter
  //   formattedFilters.date = { $gte: start, $lte: end };
  //   formattedFilters.status = "Successed";

  //   // Prepare mongoose query
  //   let queryCommand = Order.find({ ...formattedFilters }).populate({
  //     path: "details",
  //     model: "OrderDetail",
  //   });

  //   // Apply sorting
  //   if (sort) {
  //     const sortBy = sort.split(",").join(" ");
  //     queryCommand = queryCommand.sort(sortBy);
  //   }

  //   // Select specific fields
  //   if (fields) {
  //     const selectedFields = fields.split(",").join(" ");
  //     queryCommand = queryCommand.select(selectedFields);
  //   }

  //   // Pagination
  //   const pageNum = +page || 1;
  //   const pageLimit = +limit || process.env.LIMIT_ORDERS || 10;
  //   const skip = (pageNum - 1) * pageLimit;
  //   queryCommand = queryCommand.skip(skip).limit(pageLimit);

  //   // Execute query
  //   const orders = await queryCommand.exec();

  //   // Calculate total amount
  //   const totalAmount = orders.reduce(
  //     (sum, order) => sum + order.totalPrice,
  //     0
  //   );

  //   // Count total matching documents
  //   const totalOrders = await Order.find({
  //     ...formattedFilters,
  //   }).countDocuments();

  //   return {
  //     orders,
  //     totalAmount,
  //     totalOrders,
  //   };
  // }

  async getOrdersByTimes(startTime, endTime, queryParams) {
    try {
      // Chuyển đổi startTime và endTime thành kiểu Date
      const start = new Date(startTime);
      const end = new Date(new Date(endTime).setHours(23, 59, 59, 999)); // Đặt thời gian cuối ngày

      // Tạo một bản sao của queryParams để xử lý các operators
      const filteredQueryParams = { ...queryParams };

      // Loại bỏ các trường không cần thiết trong bản sao
      const excludeFields = ["sort", "fields", "startTime", "endTime"];
      excludeFields.forEach((el) => delete filteredQueryParams[el]);

      // Format lại các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(filteredQueryParams);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      // Thêm điều kiện thời gian và trạng thái vào formatedQueries
      formatedQueries.date = { $gte: start, $lte: end };
      formatedQueries.status = "Successed";

      // Tìm các đơn hàng trong khoảng thời gian đã chỉ định
      let queryCommand = Order.find({ ...formatedQueries }).populate({
        path: "details",
        model: "OrderDetail",
      });

      // Sắp xếp nếu có tham số sort
      if (queryParams.sort) {
        const sortBy = queryParams.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Lọc các trường cần thiết nếu có tham số fields
      if (queryParams.fields) {
        const fields = queryParams.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      // Phân trang
      const page = +queryParams.page || 1;
      const limit = +queryParams.limit || process.env.LIMIT_ORDERS || 100; // Giới hạn số lượng đơn hàng trên mỗi trang
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

      return {
        success: response.length > 0,
        counts,
        totalAmount,
        orders:
          response.length > 0
            ? response
            : "No successful orders found in the specified time range",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getMoMoPaymentUrl(orderId, user) {
    try {
      // 1. Lấy order từ DB
      const order = await Order.findById(orderId);
      if (!order) {
        return { success: false, message: "Order not found" };
      }

      // 2. Kiểm tra phương thức thanh toán có phải MoMo không
      if (order.payment !== "MOMO") {
        return { success: false, message: "Payment method is not MoMo" };
      }

      // 3. Tạo ID đơn hàng duy nhất
      const uniqueOrderId = `${order._id}-${Date.now()}`;

      // 4. Gọi hàm createMoMoOrder
      const momoResponse = await createMoMoOrder(
        user,
        order.totalPrice,
        uniqueOrderId
      );

      return momoResponse;
    } catch (error) {
      console.error("Error in getMoMoPaymentUrl:", error.message);
      return {
        success: false,
        message: "Failed to retrieve MoMo payment URL",
        error: error.message,
      };
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

  async checkout({
    user,
    payment,
    shippingAddress,
    recipientName,
    recipientPhone,
  }) {
    if (!payment) throw new Error("Payment method not provided");
    if (!recipientName || !recipientPhone) throw new Error("Missing Inputs");

    // const userInfo = await User.findById(user._id).select("address member");
    const userInfo = await User.findById(user._id).select("address");

    // if (!userInfo.address || userInfo.address.length === 0) {
    //   throw new Error("User address is required for checkout");
    // }

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

    // Prepare bulkWrite operations for product stock updates
    const bulkOperations = selectedItems.map((item) => ({
      updateOne: {
        filter: {
          _id: item.product._id,
          stockQuantity: { $gte: item.quantity },
        },
        update: {
          $inc: { stockQuantity: -item.quantity, soldCount: item.quantity },
        },
      },
    }));

    try {
      // Execute bulkWrite to update stock in one operation
      const bulkResult = await Product.bulkWrite(bulkOperations);

      // Check if all updates succeeded
      if (bulkResult.matchedCount !== selectedItems.length) {
        throw new Error("One or more products are out of stock.");
      }

      // Create order details for each item
      for (const item of selectedItems) {
        const product = await Product.findById(item.product._id);
        const finalPrice = await product.getFinalPrice();

        const orderDetail = new OrderDetail({
          productId: product._id,
          productName: product.name,
          productImage: product.image,
          productPrice: finalPrice,
          quantity: item.quantity,
        });

        const savedOrderDetail = await orderDetail.save();
        orderDetailsIds.push(savedOrderDetail._id);
        totalPrice += finalPrice * item.quantity;
      }

      // Apply discounts based on membership
      // const member = await Member.findById(userInfo.member);
      // if (member) {
      //   if (member.rank === "Silver") totalPrice *= 0.98;
      //   else if (member.rank === "Gold") totalPrice *= 0.95;
      //   else if (member.rank === "Diamond") totalPrice *= 0.9;
      // }
      totalPrice = Math.round(totalPrice * 100) / 100;

      const orderStatus =
        payment === Payment.OFFLINE
          ? "Pending"
          : payment === Payment.PAYPAL
          ? "Awaiting"
          : "Not Yet Paid";

      // Create the order
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

      // Remove items from the cart
      const itemsToRemove = cart.items.filter(
        (item) => item.selectedForCheckout
      );
      cart.items = cart.items.filter((item) => !item.selectedForCheckout);
      await cart.save();

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
    } catch (error) {
      // Rollback logic if error occurs
      // await Product.bulkWrite(
      //   selectedItems.map((item) => ({
      //     updateOne: {
      //       filter: { _id: item.product._id },
      //       update: {
      //         $inc: { stockQuantity: item.quantity, soldCount: -item.quantity },
      //       },
      //     },
      //   }))
      // );
      try {
        await Product.bulkWrite(
          selectedItems.map((item) => ({
            updateOne: {
              filter: { _id: item.product._id },
              update: {
                $inc: {
                  stockQuantity: item.quantity,
                  soldCount: -item.quantity,
                },
              },
            },
          }))
        );
      } catch (rollbackError) {
        console.error("Rollback stock failed:", rollbackError);
      }

      // Cleanup created order details
      if (orderDetailsIds.length > 0) {
        try {
          await OrderDetail.deleteMany({ _id: { $in: orderDetailsIds } });
        } catch (cleanupError) {
          throw new Error("Cleanup OrderDetails failed: ", cleanupError);
        }
      }

      throw new Error(error.message || "Checkout failed");
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
    order.status = "Awaiting"; // Cập nhật trạng thái đơn hàng thành Awaiting
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
      order.status = "Awaiting"; // Đánh dấu trạng thái đơn hàng là Awaiting
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
      "Awaiting",
      "Cancelled",
      "Delivering",
      "Transported",
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

      // const user = await User.findById(order.user).populate("member");
      // if (user && user.member) {
      //   user.member.score += 2 * totalQuantity; // Cộng điểm
      //   await user.member.save();
      // }
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

  // async confirmOrder(orderId, email) {
  //   // Tìm đơn hàng
  //   const order = await Order.findById(orderId).populate({
  //     path: "details",
  //     model: "OrderDetail",
  //   });
  //   if (!order) {
  //     throw new Error("Order not found");
  //   }

  //   // Kiểm tra trạng thái đơn hàng
  //   if (order.status !== "Transported") {
  //     throw new Error(
  //       "Only orders that are being Transported can be confirmed"
  //     );
  //   }

  //   // Cập nhật trạng thái thành "Successed"
  //   order.status = "Successed";
  //   await order.save();
  //   // Gửi email xác nhận
  //   const html = `<!DOCTYPE html>
  //     <html lang="vi">
  //       <head>
  //         <meta charset="UTF-8" />
  //         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  //         <title>Thư cảm ơn</title>
  //         <style>
  //           body {
  //             font-family: Arial, sans-serif;
  //             font-size: 14px;
  //             color: #333333;
  //             margin: 0;
  //             padding: 0;
  //           }
  //           .container {
  //             max-width: 600px;
  //             margin: 0 auto;
  //             border: 5px solid #39c6b9;
  //             border-radius: 10px;
  //           }
  //           .content {
  //             padding: 20px;
  //           }
  //           h1 {
  //             color: #39c6b9;
  //           }
  //           p {
  //             line-height: 1.5;
  //           }
  //           a {
  //             color: #0099ff;
  //             text-decoration: none;
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="container">
  //           <div class="content">
  //             <h1>Book Store</h1>
  //             <p>Xin chào!</p>
  //             <p>Cảm ơn bạn rất nhiều vì đã đặt hàng tại <strong>Book Store</strong>! 📚</p>
  //             <p>Chúng tôi rất trân trọng sự ủng hộ của bạn và hy vọng bạn sẽ hài lòng với sản phẩm vừa mua.</p>
  //             <p>Mong được gặp lại bạn trong những lần mua sắm tiếp theo!</p>
  //             <p>Trân trọng,</p>
  //             <p><strong>Book Store</strong></p>
  //           </div>
  //         </div>
  //       </body>
  //     </html>`;

  //   const data = { email, html };
  //   await sendMail("You're Awesome - Thanks for Shopping with Us!", data);

  //   return order;
  // }
  async confirmOrder(orderId, email) {
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

    // Cập nhật trạng thái
    order.status = "Successed";
    await order.save();

    // Tạo danh sách sản phẩm HTML
    const orderItemsHtml = order.details
      .map(
        (item) => `
          <tr>
            <td>${item.productName}</td>
            <td>${item.quantity}</td>
            <td>${item.productPrice.toLocaleString()} VND</td>
          </tr>
        `
      )
      .join("");

    const totalPrice = order.totalPrice.toLocaleString();

    const html = `<!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Thư cảm ơn</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 14px;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              border: 5px solid #39c6b9;
              border-radius: 10px;
            }
            .content {
              padding: 20px;
            }
            h1 {
              color: #39c6b9;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              padding: 8px;
              border: 1px solid #ccc;
              text-align: left;
            }
            .total {
              font-weight: bold;
              color: #e91e63;
            }
            .message {
              margin-top: 16px;
              line-height: 1.6;
            }

            .highlight {
              background-color: #f0f9f9;
              border-left: 4px solid #39c6b9;
              padding: 10px;
              margin: 16px 0;
              border-radius: 6px;
            }

            .signature {
              margin-top: 24px;
              font-style: italic;
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h1>Book Store</h1>
              <p>Xin chào!</p>
              <p>Cảm ơn bạn đã đặt hàng tại <strong>Book Store</strong>! 📚</p>
              <p>Dưới đây là thông tin đơn hàng của bạn:</p>
              <p><strong>Mã đơn hàng:</strong> ${order._id}</p>
              <p><strong>Ngày đặt:</strong> ${new Date(
                order.date
              ).toLocaleDateString("vi-VN")}</p>
              <table>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>
              <p class="total">Tổng tiền: ${totalPrice} VND</p>
              <p class="highlight">
                Quý khách đã nhận được đơn hàng thành công. Nếu có bất kỳ sai sót nào về sản phẩm hoặc quá trình giao hàng, xin vui lòng liên hệ với chúng tôi qua tin nhắn hoặc số điện thoại hỗ trợ để được giải quyết trong thời gian sớm nhất.
              </p>

              <p class="message">
                Chúng tôi luôn mong muốn mang lại trải nghiệm mua sắm tốt nhất cho Quý khách.
                Vì vậy, nếu hài lòng với sản phẩm và dịch vụ, rất mong Quý khách dành chút thời gian để đánh giá 5★ cho <strong>Book Store</strong> trên hệ thống.
              </p>

              <p class="message">
                Sự hài lòng và góp ý của Quý khách là nguồn động lực to lớn để chúng tôi ngày càng hoàn thiện và phát triển.
              </p>
              <p class="signature">Trân trọng,</p>
              <p class="signature"><strong>Book Store</strong></p>
            </div>
          </div>
        </body>
      </html>`;

    const data = { email, html };
    await sendMail("You're Awesome - Thanks for Shopping with Us!", data);

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
    callback_url: `${process.env.BASE_URL_DEV}/order/callbackZaloPay/${orderId}`,
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
  const redirectUrl = `${process.env.URL_CLIENT}/momo`;
  const ipnUrl = `${process.env.BASE_URL_DEV}/order/callbackMomo/${orderId}`;
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

module.exports = new OrderService();
