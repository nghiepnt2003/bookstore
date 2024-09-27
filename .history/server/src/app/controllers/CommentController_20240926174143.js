const Comment = require("../models/Comment");
const Product = require("../models/Product");

class CommentController {
  // [GET] /comment/all
  async getAll(req, res) {
    try {
      const queries = { ...req.query };
      const excludeFields = ["limit", "sort", "page", "fields"];
      excludeFields.forEach((el) => delete queries[el]);

      let queryString = JSON.stringify(queries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      // Filtering theo comment
      if (queries?.comment) {
        formatedQueries.comment = { $regex: queries.comment, $options: "i" };
      }

      // Filtering theo product
      if (queries?.product) {
        formatedQueries.product = queries.product; // Lọc theo sản phẩm
      }

      // Execute query
      let queryCommand = Feedback.find(formatedQueries);

      // Sorting
      if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Fields limiting
      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      // Pagination
      const page = +req.query.page || 1;
      const limit = +req.query.limit || process.env.LIMIT_FEEDBACKS;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      // Lấy danh sách bình luận
      const response = await queryCommand.exec();

      // Lấy số lượng bình luận
      const counts = await Feedback.find(formatedQueries).countDocuments();

      res.status(200).json({
        success: response.length > 0,
        counts,
        feedbacks: response.length > 0 ? response : "Cannot get feedbacks",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [POST] /comment/
  async comment(req, res) {
    try {
      const { _id } = req.user; // Lấy ID người dùng từ token
      const { product, comment } = req.body; // Lấy sản phẩm và bình luận từ request body

      if (!product || !comment)
        return res.status(400).json({
          success: false,
          message: "Missing comment or product input",
        });

      // Tạo mới bình luận
      const newComment = new Comment({
        user: _id,
        product,
        comment,
      });

      const response = await newComment.save();

      res.status(200).json({
        success: true,
        message: "Comment successful",
        data: response,
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred: " + err });
    }
  }
}

module.exports = new CommentController();
