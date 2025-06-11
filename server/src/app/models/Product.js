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
    image: { type: String, default: "" },
    description: { type: String },
    price: { type: Number, required: true }, // giá bán
    costPrice: { type: Number, default: 0 }, // Giá nhập
    // finalPrice: { type: Number }, // Giá cuối cùng sau khi giảm giá
    stockQuantity: { type: Number, default: 0 }, // Số lượng tồn kho
    lastRestocked: { type: Date, default: Date.now }, // Thời gian nhập hàng gần nhất
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
    if (
      currentDate >= discount?.startDate &&
      currentDate <= discount?.endDate
    ) {
      return parseFloat(this.price * (1 - discount.discountPercentage / 100));
    }
  }

  return this.price; // Trả về giá gốc nếu không có giảm giá hợp lệ
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
