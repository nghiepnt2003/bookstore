const Comment = require("../models/Comment");
const Product = require("../models/Product");

class CommentController {
  // [GET] /comment/
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
      let queryCommand = Comment.find(formatedQueries);

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
      const limit = +req.query.limit || process.env.LIMIT_COMMENTS;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      // Lấy danh sách bình luận
      const response = await queryCommand.exec();

      // Lấy số lượng bình luận
      const counts = await Comment.find(formatedQueries).countDocuments();

      res.status(200).json({
        success: response.length > 0,
        counts,
        comments: response.length > 0 ? response : "Cannot get comments",
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
  // [DELETE] /comment/:id/force
  async forceDelete(req, res) {
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
        comment.user.toString() !== userId.toString() ||
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

module.exports = new CommentController();
