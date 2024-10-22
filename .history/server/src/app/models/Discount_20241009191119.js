const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const discountSchema = new Schema(
  {
    _id: { type: Number },
    discountPercentage: { type: Number, required: true }, // Phần trăm giảm giá
    startDate: { type: Date, required: true }, // Ngày bắt đầu giảm giá
    endDate: { type: Date, required: true }, // Ngày kết thúc giảm giá
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discount", discountSchema);
