const Product = require("../models/Product");
const User = require("../models/User");

class WishlistService {
  // Lấy danh sách wishlist của người dùng
  // async getWishlist(userId) {
  //   try {
  //     // Lấy thông tin người dùng và danh sách wishList
  //     const user = await User.findById(userId).populate({
  //       path: "wishList",
  //       populate: [
  //         { path: "author", select: "name" }, // Populate thông tin author
  //         { path: "publisher", select: "name" }, // Populate thông tin publisher
  //         { path: "categories", select: "name" },
  //         {
  //           path: "discount",
  //           match: {
  //             startDate: { $lte: new Date() }, // Giảm giá đã bắt đầu
  //             endDate: { $gte: new Date() }, // Giảm giá chưa hết hạn
  //           },
  //           select: "discountPercentage startDate endDate",
  //         }, // Populate thông tin category
  //       ],
  //     });

  //     // Nếu người dùng không tồn tại
  //     if (!user) {
  //       throw new Error("User not found");
  //     }

  //     return user.wishList; // Trả về danh sách wishList
  //   } catch (error) {
  //     throw new Error("An error occurred: " + error.message);
  //   }
  // }
  async getWishlist(userId) {
    try {
      // Lấy thông tin người dùng và danh sách wishList
      const user = await User.findById(userId).populate({
        path: "wishList",
        populate: [
          { path: "author", select: "name" },
          { path: "publisher", select: "name" },
          { path: "categories", select: "name" },
          {
            path: "discount",
            match: {
              startDate: { $lte: new Date() }, // Giảm giá đã bắt đầu
              endDate: { $gte: new Date() }, // Giảm giá chưa hết hạn
            },
            select: "discountPercentage startDate endDate",
          },
        ],
      });

      // Nếu người dùng không tồn tại
      if (!user) {
        throw new Error("User not found");
      }

      // Tính finalPrice và timeRemaining
      const wishlistWithFinalPrice = await Promise.all(
        user.wishList.map(async (product) => {
          if (!product) return null;
          const finalPrice = await product.getFinalPrice();
          let timeRemaining = null;
          if (product.discount && product.discount?.endDate) {
            timeRemaining =
              product.discount.endDate.getTime() - new Date().getTime();
            if (timeRemaining <= 0) timeRemaining = 0;
          }
          return {
            ...product.toObject(),
            finalPrice: parseFloat(finalPrice.toFixed(2)),
            timeRemaining,
          };
        })
      );

      return wishlistWithFinalPrice;
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
  async removeAllFromWishlist(userId) {
    try {
      // Lấy thông tin user từ DB
      const user = await User.findById(userId);

      if (!user) {
        return {
          status: 404,
          success: false,
          message: "User not found",
          wishList: [],
        };
      }

      // Khởi tạo wishList nếu chưa tồn tại
      if (!Array.isArray(user.wishList)) {
        user.wishList = [];
      }

      // Xóa tất cả sản phẩm khỏi wishlist
      user.wishList = []; // Đặt wishlist thành mảng rỗng

      await user.save();

      return {
        status: 200,
        success: true,
        message: "All products removed from wishlist",
        wishList: user.wishList, // Trả về wishlist (sẽ là mảng rỗng)
      };
    } catch (error) {
      throw new Error("An error occurred: " + error.message);
    }
  }
}

module.exports = new WishlistService();
