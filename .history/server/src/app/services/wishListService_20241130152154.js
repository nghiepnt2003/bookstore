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
}

module.exports = new WishlistService();
