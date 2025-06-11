const mongoose = require("mongoose");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;

const ratingSchema = new Schema(
  {
    _id: { type: Number },
    star: { type: Number, required: true, min: 1, max: 5 }, // Đánh giá sao
    user: { type: Number, ref: "User", required: true }, // Người dùng
    product: { type: Number, ref: "Product", required: true }, // Sản phẩm
  },
  { timestamps: true }
);

// Add Plugins
ratingSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
ratingSchema.plugin(AutoIncrement, { id: "rating_seq", inc_field: "_id" });

module.exports = mongoose.model("Rating", ratingSchema);
