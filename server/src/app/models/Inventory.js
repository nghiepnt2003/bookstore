const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const mongooseDelete = require("mongoose-delete");
const Schema = mongoose.Schema;

const inventorySchema = new Schema(
  {
    _id: { type: Number }, // ID tự động tăng
    // warehouse: { type: String, required: true }, // Kho nhập hàng
    // supplier: { type: String }, // Nhà cung cấp (nếu có)
    totalCost: { type: Number, required: true }, // Tổng giá trị của phiếu nhập kho
    note: { type: String }, // Ghi chú thêm
  },
  { timestamps: true }
);
// createdAt: Ngày và giờ tài liệu được tạo (có thể hiểu là ngày tạo phiếu nhập hàng trong trường hợp này).
// updatedAt: Ngày và giờ tài liệu được cập nhật lần cuối.

// Add Plugins
inventorySchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
inventorySchema.plugin(AutoIncrement, {
  id: "inventory_seq",
  inc_field: "_id",
});

module.exports = mongoose.model("Inventory", inventorySchema);
