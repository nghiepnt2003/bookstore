const mongoose = require("mongoose");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    _id: { type: Number },
    comment: { type: String, maxLength: 1000, required: true }, // Bình luận bắt buộc
    user: { type: Number, ref: "User", required: true }, // Người dùng
    product: { type: Number, ref: "Product", required: true }, // Sản phẩm
    rating: { type: Number, ref: "Rating", required: true }, // Liên kết với rating
  },
  { timestamps: true }
);

// Add Plugins
commentSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
commentSchema.plugin(AutoIncrement, { id: "comment_seq", inc_field: "_id" });

module.exports = mongoose.model("Comment", commentSchema);
