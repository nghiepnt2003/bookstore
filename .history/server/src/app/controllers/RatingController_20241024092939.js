const Order = require("../models/Order");
const Product = require("../models/Product");
const Rating = require("../models/Rating");

class RatingController {
  // [GET] /rating/
  async getRatings(req, res) {
    try {
      const queries = { ...req.query };
      const excludeFields = ["limit", "sort", "page", "fields"];
      excludeFields.forEach((el) => delete queries[el]);

      // Format lại các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(queries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      // Lọc theo product nếu có trong query
      if (queries?.product) {
        formatedQueries.product = queries.product;
      }

      // Execute query
      let queryCommand = Rating.find(formatedQueries).populate({
        path: "user",
        select: "username fullname", // Chỉ lấy các trường cần thiết từ user
      });

      // Sorting
      if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // fields limiting
      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      // Pagination
      const page = +req.query.page || 1;
      const limit = +req.query.limit || process.env.LIMIT_RATINGS || 10;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      // Thực thi truy vấn
      const ratings = await queryCommand.exec();

      // Đếm số lượng đánh giá
      const counts = await Rating.find(formatedQueries).countDocuments();

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
}

module.exports = new RatingController();
