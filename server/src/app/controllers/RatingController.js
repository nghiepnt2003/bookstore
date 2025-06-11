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

      await ratingService.forceDelete(id, req.user._id);

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
