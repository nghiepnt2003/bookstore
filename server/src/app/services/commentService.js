const Comment = require("../models/Comment");
const Product = require("../models/Product");

class CommentService {
  async getAllComments(queries) {
    const queryCopy = { ...queries };
    const excludeFields = ["limit", "sort", "page", "fields"];
    excludeFields.forEach((el) => delete queryCopy[el]);

    let queryString = JSON.stringify(queryCopy);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (matchedEl) => `$${matchedEl}`
    );
    const formatedQueries = JSON.parse(queryString);

    if (queries?.comment) {
      formatedQueries.comment = { $regex: queries.comment, $options: "i" };
    }

    if (queries?.product) {
      formatedQueries.product = queries.product;
    }

    const queryCommand = Comment.find(formatedQueries).populate({
      path: "product",
      model: "Product",
      populate: {
        path: "categories",
        model: "Category",
        select: "name",
      },
    });

    return { queryCommand, formatedQueries };
  }

  async getCommentsByProduct(productId, queries) {
    const productExists = await Product.findById(productId);
    if (!productExists) {
      throw new Error("Product not found");
    }
    const queriesCopy = { ...queries };

    const excludeFields = ["limit", "sort", "page", "fields"];
    excludeFields.forEach((el) => delete queriesCopy[el]);

    let queryString = JSON.stringify(queriesCopy);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (matchedEl) => `$${matchedEl}`
    );
    const formatedQueries = JSON.parse(queryString);

    if (queries?.comment) {
      formatedQueries.comment = { $regex: queries.comment, $options: "i" };
    }

    formatedQueries.product = productId;

    const queryCommand = Comment.find(formatedQueries).populate({
      path: "product",
      model: "Product",
      populate: {
        path: "categories",
        model: "Category",
        select: "name",
      },
    });

    return { queryCommand, formatedQueries };
  }

  async createComment(userId, product, comment) {
    const newComment = new Comment({ user: userId, product, comment });
    return await newComment.save();
  }

  async updateComment(userId, commentId, comment) {
    const existingComment = await Comment.findById(commentId).populate({
      path: "product",
      model: "Product",
      populate: {
        path: "categories",
        model: "Category",
        select: "name",
      },
    });

    if (!existingComment) throw new Error("Comment not found");

    if (existingComment.user.toString() !== userId.toString()) {
      throw new Error("You do not have permission to edit this comment");
    }

    existingComment.comment = comment;
    return await existingComment.save();
  }

  async deleteComment(userId, role, commentId) {
    const comment = await Comment.findById(commentId);

    if (!comment) throw new Error("Comment not found");

    if (comment.user.toString() !== userId.toString() && role !== "admin") {
      throw new Error("You do not have permission to delete this comment");
    }

    await Comment.deleteOne({ _id: commentId });
  }
}

module.exports = new CommentService();
