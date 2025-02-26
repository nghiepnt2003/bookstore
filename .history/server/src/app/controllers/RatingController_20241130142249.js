const Product = require("../models/Product");
const Rating = require("../models/Rating");
const ratingService = require("../services/ratingService");

class RatingController {
  // [GET] /rating/
  async getRatings(req, res) {
    try {
      const queries = { ...req.query };
      const { ratings, counts } = await ratingService.getRatings(queries);

      res.status(200).json({
        success: ratings.length > 0,
        counts,
        ratings: ratings.length > 0 ? ratings : "No ratings found",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  // [POST] /rating/create
  async rating(req, res) {
    try {
      const { _id } = req.user; // Lấy ID người dùng từ token
      const { star, product } = req.body; // Lấy số sao và sản phẩm từ request body

      if (!star || !product) {
        return res
          .status(400)
          .json({ success: false, message: "Missing star or product input" });
      }

      const rating = await ratingService.rating(_id, star, product);

      res.status(200).json({
        success: true,
        message: "Rating successful",
        data: rating,
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred: " + err.message });
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
}

module.exports = new RatingController();
