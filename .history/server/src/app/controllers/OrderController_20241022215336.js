const Cart = require("../models/Cart");
const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const Product = require("../models/Product");
const LineItem = require("../models/LineItem");
const User = require("../models/User");

class OrderController {
  // [GET] /order/:id
  async getById(req, res) {
    try {
      // hoặc .populate("details")
      let order = await Order.findOne({ _id: req.params.id }).populate({
        path: "details",
        model: "OrderDetail",
      });
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

  //[POST] /order/checkout
  // [POST] /order/checkout
  async checkout(req, res) {
    try {
      const user = req.user; // Lấy thông tin user từ accessToken
      const payment = req.body.payment;
      const shippingAddress = req.body.shippingAddress; // Nhận địa chỉ giao hàng từ request

      if (!payment) {
        return res
          .status(400)
          .json({ success: false, message: "Payment method not provided" });
      }
      // Kiểm tra xem người dùng có địa chỉ hay không
      const userInfo = await User.findById(user._id).select("address");

      if (!userInfo.address || userInfo.address.length === 0) {
        return res.status(400).json({
          success: false,
          message: "User address is required for checkout",
        });
      }
      // Kiểm tra xem địa chỉ giao hàng có nằm trong danh sách địa chỉ của người dùng không
      if (!userInfo.address.includes(shippingAddress)) {
        return res.status(400).json({
          success: false,
          message: "Invalid shipping address",
        });
      }

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

      // Tạo đơn hàng mới với thông tin chi tiết đã tạo
      const newOrder = await Order.create({
        details: orderDetailsIds,
        date: new Date(),
        status: "Pending",
        totalPrice: totalPrice, // Tổng giá trị sau khi áp dụng giảm giá
        payment: payment, // Phương thức thanh toán
        user: user._id,
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

      res.status(200).json({
        success: true,
        message: "Checkout successful",
        order: newOrder,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Checkout failed",
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
