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
  app_id: "2554",
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
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
    embed_data: JSON.stringify({
      // redirecturl: "https://your-redirect-url.com",
    }),
    callback_url: "https://your-callback-url.com/callback",
    description: `Payment for order #${orderId}`,
  };

  const data = `${config.app_id}|${zalopayOrder.app_trans_id}|${zalopayOrder.app_user}|${zalopayOrder.amount}|${zalopayOrder.app_time}|${zalopayOrder.embed_data}|${zalopayOrder.item}`;
  zalopayOrder.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  try {
    const zalopayResponse = await axios.post(config.endpoint, null, {
      params: zalopayOrder,
    });
    return {
      success: true,
      zalopayUrl: zalopayResponse.data.order_url,
    };
  } catch (error) {
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
      // hoặc .populate("details")
      let order = await Order.findOne({ _id: req.params.id }).populate({
        path: "details",
        model: "OrderDetail",
      });
      // Kiểm tra xem đơn hàng có thuộc về người dùng hiện tại không
      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied: This order does not belong to you.",
        });
      }
      res.status(200).json({ success: order ? true : false, order });
    } catch (error) {
      res.status(500).json({ success: false, message: error });
    }
  }
  // [GET] /order/getByUser
  async getAllsByUser(req, res) {
    try {
      const { _id } = req.user; // Lấy user ID từ access token (phải có middleware xác thực trước đó)

      // Tìm các đơn hàng của người dùng
      const orders = await Order.find({ user: _id })
        .populate({
          path: "details",
          model: "OrderDetail",
        }) // Populate các OrderDetail nếu cần
        .sort({ date: -1 }); // Sắp xếp theo ngày (mới nhất trước)

      if (!orders || orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No orders found for this user",
        });
      }

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  //[GET] /order/getAll
  async getAllByAdmin(req, res) {
    try {
      const queries = { ...req.query };

      // Tách các trường đặc biệt ra khỏi query
      const excludeFields = ["limit", "sort", "page", "fields"];
      excludeFields.forEach((el) => delete queries[el]);

      // Format lại các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(queries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      // Filtering
      if (queries?.status) {
        formatedQueries.status = { $regex: queries.status, $options: "i" }; // Tìm kiếm đơn hàng theo trạng thái (status)
      }

      // Execute query
      let queryCommand = Order.find(formatedQueries).populate({
        path: "details",
        model: "OrderDetail",
      });

      if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Field limiting
      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      // Pagination
      const page = +req.query.page || 1;
      const limit = +req.query.limit || process.env.LIMIT_ORDERS || 10; // Giới hạn số lượng đơn hàng trên mỗi trang
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      // Lấy danh sách đơn hàng
      const response = await queryCommand.exec();

      // Lấy số lượng đơn hàng
      const counts = await Order.find(formatedQueries).countDocuments();

      res.status(200).json({
        success: response.length > 0,
        counts,
        orders: response.length > 0 ? response : "Cannot get orders",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //[GET] /order/checkOrderStatus/orderId
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
      } else if (order.status === "Not Yet Paid") {
        return res.json({ success: false, message: "Order not yet paid" });
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

  //[POST] /order/checkout
  async checkout(req, res) {
    try {
      const user = req.user; // Lấy thông tin user từ accessToken
      // const payment = req.body.payment;
      // const shippingAddress = req.body.shippingAddress; // Nhận địa chỉ giao hàng từ request
      const { payment, shippingAddress, recipientName } = req.body; // Lấy phương thức thanh toán và địa chỉ giao hàng từ yêu cầu

      if (!payment) {
        return res
          .status(400)
          .json({ success: false, message: "Payment method not provided" });
      }
      if (!recipientName) {
        return res
          .status(400)
          .json({ success: false, message: "Recipient name is required" });
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

      // Vòng lặp for để tạo OrderDetail cho mỗi item
      for (const item of selectedItems) {
        // Tính giá cuối cùng của sản phẩm (có áp dụng giảm giá nếu có)
        const finalPrice = await item.product.getFinalPrice();
        console.log(finalPrice);
        // Tạo OrderDetail cho mỗi sản phẩm đã chọn
        const orderDetail = new OrderDetail({
          productId: item.product._id,
          productName: item.product.name,
          productImage: item.product.image,
          productPrice: finalPrice, // Lưu giá đã được giảm (nếu có)
          quantity: item.quantity,
        });

        // Lưu OrderDetail vào cơ sở dữ liệu
        const savedOrderDetail = await orderDetail.save();
        orderDetailsIds.push(savedOrderDetail._id);

        // Tính tổng giá trị đơn hàng
        totalPrice += finalPrice * item.quantity;

        // Cập nhật số lượng sản phẩm đã bán
        await Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { soldCount: item.quantity } }, // Cộng thêm số lượng đã bán
          { new: true } // Trả về tài liệu đã được cập nhật
        );
      }
      // Kiểm tra rank của user để áp dụng giảm giá
      const member = await Member.findById(userInfo.member);
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
        payment === Payment.OFFLINE ? "Pending" : "Not Yet Paid";

      // Tạo đơn hàng mới với thông tin chi tiết đã tạo
      const newOrder = await Order.create({
        details: orderDetailsIds,
        recipientName: recipientName,
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

      // Xóa các LineItem tương ứng khỏi cơ sở dữ liệu
      for (const item of itemsToRemove) {
        await LineItem.findByIdAndDelete(item._id);
      }

      // res.status(200).json({
      //   success: true,
      //   message: "Checkout successful",
      //   order: newOrder,
      // });
      if (payment === Payment.MOMO) {
        // const qrCodeUrl = await generateMoMoQR("0357130507", totalPrice);
        const qrCodeUrl = await generateMoMoQR("0357130507", 1000);

        res.status(200).json({
          success: true,
          message: "Checkout successful",
          order: newOrder,
          qrCode: qrCodeUrl, // Trả về mã QR để quét thanh toán
        });
      } else if (payment === Payment.ZALOPAY) {
        const zaloPayResponse = await createZaloPayOrder(
          user,
          totalPrice,
          newOrder._id
        );
        if (zaloPayResponse.success) {
          res.status(200).json({
            success: true,
            message: "Checkout successful",
            order: newOrder,
            zalopayUrl: zaloPayResponse.zalopayUrl,
          });
        } else {
          res.status(500).json({
            success: false,
            message: "ZaloPay payment initialization failed",
            error: zaloPayResponse.error,
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
        message:
          "QR code scanned successfully, order status updated to Pending",
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
      const validStatuses = ["Pending", "Cancelled", "Processing", "Successed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      // Tìm đơn hàng theo ID
      const order = await Order.findById(id);
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

  // [DELETE] /order/:id
  // async deleteByUser(req, res) {
  //   try {
  //     const { id } = req.params;
  //     const userId = req.user._id; // Lấy user ID từ access token

  //     // Tìm đơn hàng theo ID và kiểm tra xem nó có thuộc về người dùng không và có trạng thái là "Pending" không
  //     const order = await Order.findOne({
  //       _id: id,
  //       user: userId,
  //       status: "Pending",
  //     });
  //     console.log(order);
  //     if (!order) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "Order not found or cannot be deleted",
  //       });
  //     }

  //     // Xóa đơn hàng
  //     await order.delete();

  //     res.status(200).json({
  //       success: true,
  //       message: "Order deleted successfully",
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }
  async deleteByUser(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id; // Lấy user ID từ access token

      // Tìm đơn hàng theo ID và kiểm tra xem nó có thuộc về người dùng không
      const order = await Order.findOne({
        _id: id,
        user: userId,
      });

      // Kiểm tra trạng thái của đơn hàng
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found or cannot be deleted",
        });
      }

      if (order.status !== "Pending") {
        return res.status(400).json({
          success: false,
          message:
            "You cannot delete this order because it is not in Pending status.",
        });
      }

      // Xóa tất cả OrderDetails liên quan
      await OrderDetail.deleteMany({ _id: { $in: order.details } });

      // Xóa đơn hàng
      await order.delete();

      res.status(200).json({
        success: true,
        message: "Order and related order details deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
module.exports = new OrderController();
