const Order = require("../models/Order");
const Product = require("../models/Product");
const Rating = require("../models/Rating");

class RatingController {
  // [POST] /rating/create
  async rating(req, res) {
    try {
      const { _id } = req.user; // Lấy ID người dùng từ token
      const { star, product } = req.body; // Lấy số sao và sản phẩm từ request body

      if (!star || !product)
        return res
          .status(400)
          .json({ success: false, message: "Missing star or product input" });

      // Tìm rating của người dùng cho sản phẩm này
      let rating = await Rating.findOne({ user: _id, product });

      if (rating) {
        // Nếu đã có rating, cập nhật số sao
        rating = await Rating.findByIdAndUpdate(
          rating._id,
          { star },
          { new: true }
        );
      } else {
        // Tạo mới rating
        rating = new Rating({
          user: _id,
          star,
          product,
        });
        await rating.save();
      }

      // Tính lại rating trung bình
      const ratings = await Rating.find({ product });
      const avgRating = (
        ratings.reduce((acc, item) => acc + item.star, 0) / ratings.length
      ).toFixed(1);

      // Cập nhật averageRating trong Product
      await Product.findByIdAndUpdate(product, {
        averageRating: parseFloat(avgRating),
      });

      res.status(200).json({
        success: true,
        message: "Rating successful",
        data: rating,
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred: " + err });
    }
  }

  // [DELETE] /rating/:id/force
  async forceDelete(req, res) {
    try {
      const { id } = req.params;

      // Lấy thông tin rating để cập nhật lại averageRating của product
      const rating = await Rating.findById(id);
      if (!rating) {
        return res.status(404).json({
          success: false,
          message: "Rating not found",
        });
      }

      // Kiểm tra xem rating này có thuộc về user hiện tại không
      if (rating.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this rating",
        });
      }

      // Xóa rating
      const response = await Rating.deleteOne({ _id: id });
      if (response.deletedCount === 0) {
        return res.status(500).json({
          success: false,
          message: "Failed to delete rating",
        });
      }

      // Cập nhật lại averageRating cho sản phẩm
      const ratings = await Rating.find({ product: rating.product });
      const avgRating =
        ratings.length > 0
          ? (
              ratings.reduce((acc, item) => acc + item.star, 0) / ratings.length
            ).toFixed(1)
          : 0; // Giữ 1 chữ số thập phân

      // Cập nhật averageRating trong sản phẩm
      await Product.findByIdAndUpdate(rating.product, {
        averageRating: parseFloat(avgRating),
      });

      res.status(200).json({
        success: true,
        message: "Rating deleted successfully",
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred: " + err.message });
    }
  }
  // [DELETE] /comment/:id
  async deleteComment(req, res) {
    try {
      const { id } = req.params; // Lấy ID bình luận từ params
      const userId = req.user._id; // Lấy ID người dùng từ token
      const userRole = req.user.role; // Lấy vai trò của người dùng

      // Tìm bình luận theo ID
      const comment = await Comment.findById(id);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

      // Kiểm tra xem người dùng có quyền xóa không
      if (
        comment.user.toString() !== userId.toString() &&
        userRole !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to delete this comment",
        });
      }

      // Xóa bình luận
      await Comment.delete({ _id: id });

      res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new RatingController();
