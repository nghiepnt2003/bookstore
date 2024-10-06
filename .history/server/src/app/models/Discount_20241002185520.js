const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const discountSchema = new Schema(
  {
    discountPercentage: { type: Number, required: true }, // Phần trăm giảm giá
    startDate: { type: Date, required: true }, // Ngày bắt đầu giảm giá
    endDate: { type: Date, required: true }, // Ngày kết thúc giảm giá
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discount", discountSchema);
