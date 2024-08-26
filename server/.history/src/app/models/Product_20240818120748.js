const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
// mongoose.plugin(slug);

mongoose.plugin(mongooseSlugUpdater);

const productSchema = new Schema(
  {
    _id: { type: Number, required: true },
    name: { type: String, maxLength: 255, required: true },
    image: { type: String, maxLength: 255 },
    description: { type: String, maxLength: 600 },
    price: { type: Number, required: true },
    datePublic: { type: Date, required: true },
    size: { type: Date, maxLength: 100 },
    pageNumber: { type: Number, required: true },
    discount: { type: mongoose.Schema.Types.Decimal128 },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
    },
    // Khi slug trùng thì do cái thư viện cài nó có tích hợp 1 thư viện
    // tên là short ID : nó sẽ tạo ra một đoạn ID ngẫu nhiên thêm  vào sau đuôi của slug để không bị trùng
    slug: { type: String, slug: "name", unique: true },
    level: { type: String, maxLength: 255 },
  },

  { _id: false, timestamps: true }
);

// Custom Query helpers
productSchema.query.sortable = function (req) {
  if (req.query.hasOwnProperty("_sort")) {
    const isValidType = ["asc", "desc"].includes(req.query.type);
    return this.sort({
      [req.query.column]: isValidType ? req.query.type : "desc",
    });
  }
  return this;
};

// Add Plugins
productSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
productSchema.plugin(AutoIncrement);

module.exports = mongoose.model("Product", productSchema);
