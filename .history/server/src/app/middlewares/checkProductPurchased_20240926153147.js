const Order = require("../models/Order"); // Thay đổi đường dẫn nếu cần
const mongoose = require("mongoose");

const checkProductPurchased = async (req, res, next) => {
  try {
    const { _id } = req.user; // Lấy ID của người dùng từ token (giả sử đã được xác thực)
    const { product } = req.body; // Lấy productId từ yêu cầu (có thể thay đổi tùy theo cấu trúc request)

    // Tìm tất cả các đơn hàng của người dùng và populate các OrderDetail
    const orders = await Order.find({ user: _id }).populate("details");

    // Kiểm tra nếu có bất kỳ OrderDetail nào có productId trùng khớp
    const orderExists = orders.some((order) =>
      order.details.some((detail) => {
        console.log("123", detail);
        return detail.productId === product;
      })
    );

    if (orderExists) {
      // Nếu đã mua sản phẩm, tiếp tục với request
      next();
    } else {
      // Nếu chưa mua sản phẩm, trả về lỗi
      return res.status(403).json({
        success: false,
        message: "You can only rate products you have purchased.",
      });
    }
  } catch (error) {
    console.error("Error checking product purchase:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = checkProductPurchased;
