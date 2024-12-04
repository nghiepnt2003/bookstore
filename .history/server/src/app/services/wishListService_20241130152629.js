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
}

module.exports = new WishlistService();
