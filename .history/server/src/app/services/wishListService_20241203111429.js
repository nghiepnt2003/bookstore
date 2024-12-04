const Product = require("../models/Product");
const User = require("../models/User");

class WishlistService {
  // Lấy danh sách wishlist của người dùng
  async getWishlist(userId) {
    try {
      // Lấy thông tin người dùng và danh sách wishList
      const user = await User.findById(userId).populate({
        path: "wishList",
        populate: [
          { path: "author", select: "name" }, // Populate thông tin author
          { path: "publisher", select: "name" }, // Populate thông tin publisher
          { path: "categories", select: "name" }, // Populate thông tin category
        ],
      });

      // Nếu người dùng không tồn tại
      if (!user) {
        throw new Error("User not found");
      }

      return user.wishList; // Trả về danh sách wishList
    } catch (error) {
      throw new Error("An error occurred: " + error.message);
    }
  }

  // Thêm sản phẩm vào wishlist của người dùng
  async addToWishlist(userId, productId) {
    try {
      // Kiểm tra sự tồn tại của sản phẩm
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      // Lấy thông tin người dùng
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      if (!Array.isArray(user.wishList)) {
        user.wishList = [];
      }

      // Kiểm tra xem sản phẩm đã có trong wishList chưa
      if (user.wishList.includes(productId)) {
        throw new Error("Product already in wishList");
      }

      // Nếu chưa có, thêm sản phẩm vào wishList
      user.wishList.push(productId);
      await user.save();

      return user.wishList; // Trả về danh sách wishList đã được cập nhật
    } catch (error) {
      throw new Error("An error occurred: " + error.message);
    }
  }

  // [DELETE] /user/wishlist/removeAll
  async removeAllFromWishlist(req, res) {
    try {
      const { _id } = req.user; // Lấy ID của user từ token

      // Lấy thông tin user
      const user = await User.findById(_id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Khởi tạo wishList nếu chưa tồn tại
      if (!Array.isArray(user.wishList)) {
        user.wishList = [];
      }

      // Xóa tất cả sản phẩm khỏi wishlist
      user.wishList = []; // Đặt wishlist thành mảng rỗng

      await user.save();

      return res.status(200).json({
        success: true,
        message: "All products removed from wishlist",
        wishList: user.wishList, // Trả về wishlist (sẽ là mảng rỗng)
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }
}

module.exports = new WishlistService();
