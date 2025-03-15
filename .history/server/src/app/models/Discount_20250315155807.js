const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
mongoose.plugin(mongooseSlugUpdater);
const discountSchema = new Schema(
  {
    _id: { type: Number },
    name: { type: String, required: true }, // Tên chương trình giảm giá
    discountPercentage: { type: Number, required: true }, // Phần trăm giảm giá
    startDate: { type: Date, required: true }, // Ngày bắt đầu giảm giá
    endDate: { type: Date, required: true }, // Ngày kết thúc giảm giá
  },
  { timestamps: true }
);
// Add Plugins
discountSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
discountSchema.plugin(AutoIncrement, { id: "discount_seq", inc_field: "_id" });
module.exports = mongoose.model("Discount", discountSchema);
