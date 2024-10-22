const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
// mongoose.plugin(slug);

mongoose.plugin(mongooseSlugUpdater);

const productSchema = new Schema(
  {
    _id: { type: Number },
    name: { type: String, maxLength: 255, required: true },
    image: { type: String, maxLength: 255 },
    description: { type: String, maxLength: 600 },
    price: { type: Number, required: true },
    datePublic: { type: Date },
    pageNumber: { type: Number, required: true },
    // discount: { type: mongoose.Schema.Types.Decimal128, default: 0 },
    slug: { type: String, slug: "name", unique: true },
    soldCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },

    author: [{ type: Number, ref: "Author", required: true }],

    publisher: {
      type: Number,
      ref: "Publisher",
      required: true,
    },
    categories: [{ type: Number, ref: "Category", required: true }],
    // Khi slug trùng thì do cái thư viện cài nó có tích hợp 1 thư viện
    // tên là short ID : nó sẽ tạo ra một đoạn ID ngẫu nhiên thêm  vào sau đuôi của slug để không bị trùng
    // slug: { type: String, slug: "name", unique: true },
    // level: { type: String, maxLength: 255 },

    discount: { type: Number, ref: "Discount" }, // Liên kết với các discount
  },

  { timestamps: true }
);

productSchema.methods.getFinalPrice = async function () {
  const currentDate = new Date();

  // Kiểm tra nếu sản phẩm có giảm giá
  if (this.discount) {
    const discount = await mongoose.model("Discount").findById(this.discount);
    // Kiểm tra nếu giảm giá nằm trong khoảng thời gian hợp lệ
    if (currentDate >= discount.startDate && currentDate <= discount.endDate) {
      // return parseFloat(
      //   this.price * (1 - discount.discountPercentage / 100)
      // ).toFixed(2);
      const discountedPrice =
        this.price * (1 - discount.discountPercentage / 100);
      return Math.round(discountedPrice * 100) / 100;
    }
  }

  // return this.price; // Trả về giá gốc nếu không có giảm giá hợp lệ
  return Math.round(this.price * 100) / 100; // Làm tròn 2 chữ số thập phân
};

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
productSchema.plugin(AutoIncrement, { id: "product_seq", inc_field: "_id" });

module.exports = mongoose.model("Product", productSchema);
