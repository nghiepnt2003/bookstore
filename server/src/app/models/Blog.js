const mongoose = require("mongoose");
const mongooseSlugUpdater = require("mongoose-slug-updater");
const mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;

// Đăng ký plugin slug-updater cho mongoose
mongoose.plugin(mongooseSlugUpdater);

const blogSchema = new Schema(
  {
    _id: { type: Number },
    title: { type: String, required: true, maxLength: 255 },
    image: { type: String },
    slug: { type: String, slug: "title", unique: true }, // Tạo slug từ title, đảm bảo unique
    content: { type: String, required: true }, // Nội dung bài viết
    author: { type: Number, ref: "User", required: true }, // Người viết bài, liên kết với User
    categories: [{ type: Number, ref: "Category" }], // Danh mục bài viết (nếu cần)
    tags: [{ type: String }], // Các từ khóa liên quan đến bài viết
    views: { type: Number, default: 0 }, // Số lượt xem
    isPublished: { type: Boolean, default: false }, // Trạng thái xuất bản của bài viết
  },
  { timestamps: true }
);

// Custom Query Helper để sắp xếp
blogSchema.query.sortable = function (req) {
  if (req.query.hasOwnProperty("_sort")) {
    const isValidType = ["asc", "desc"].includes(req.query.type);
    return this.sort({
      [req.query.column]: isValidType ? req.query.type : "desc",
    });
  }
  return this;
};

// Add Plugins
blogSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
blogSchema.plugin(AutoIncrement, { id: "blog_seq", inc_field: "_id" });

module.exports = mongoose.model("Blog", blogSchema);
