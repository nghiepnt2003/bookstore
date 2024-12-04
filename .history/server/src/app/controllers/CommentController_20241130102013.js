const Comment = require("../models/Comment");
const Product = require("../models/Product");
const commentService = require("../services/commentService");

class CommentController {
  // [GET] /comment/
  async getAll(req, res) {
    try {
      const { queryCommand, formatedQueries } =
        await commentService.getAllComments(req.query);

      const page = +req.query.page || 1;
      const limit = +req.query.limit || process.env.LIMIT_COMMENTS;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      const response = await queryCommand.exec();
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
  // [GET] /comment/product/:productId
  async getCommentByProduct(req, res) {
    try {
      const { productId } = req.params;
      const { queryCommand, formatedQueries } =
        await commentService.getCommentsByProduct(productId, req.query);

      const page = +req.query.page || 1;
      const limit = +req.query.limit || process.env.LIMIT_COMMENTS;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      const response = await queryCommand.exec();
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
      const { _id } = req.user;
      const { product, comment } = req.body;

      if (!product || !comment)
        return res.status(400).json({
          success: false,
          message: "Missing comment or product input",
        });

      const response = await commentService.createComment(
        _id,
        product,
        comment
      );

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

  // [PUT] /comment/:id
  async editComment(req, res) {
    try {
      const { id } = req.params;
      const { _id } = req.user;
      const { comment } = req.body;

      if (!comment || comment.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Comment cannot be empty",
        });
      }

      const updatedComment = await commentService.updateComment(
        _id,
        id,
        comment
      );

      res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        data: updatedComment,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [DELETE] /comment/:id/force
  async forceDelete(req, res) {
    try {
      const { id } = req.params;
      const { _id, role } = req.user;

      await commentService.deleteComment(_id, role, id);

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
