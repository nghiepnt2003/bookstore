const Order = require("../models/Order"); // Đảm bảo đường dẫn đúng
const mongoose = require("mongoose");

const checkProductPurchased = async (req, res, next) => {
  try {
    const { _id } = req.user; // Lấy ID của người dùng từ token (giả sử đã được xác thực)
    const { product } = req.body; // Lấy productId từ yêu cầu (có thể thay đổi tùy theo cấu trúc request)

    // Tìm tất cả các đơn hàng của người dùng và populate các OrderDetail
    const orders = await Order.find({ user: _id }).populate("details");

    // Kiểm tra xem có bất kỳ OrderDetail nào có productId trùng khớp
    const foundOrderDetail = orders.find((order) =>
      order.details.find(
        (detail) => detail.productId.toString() === product.toString()
      )
    );

    if (foundOrderDetail) {
      // Nếu đã tìm thấy sản phẩm, tiếp tục với request
      next();
    } else {
      // Nếu chưa tìm thấy sản phẩm, trả về lỗi
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
