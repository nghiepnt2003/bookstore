const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const mongooseDelete = require("mongoose-delete");
const Schema = mongoose.Schema;

const inventorySchema = new Schema(
  {
    _id: { type: Number }, // ID tự động tăng
    warehouse: { type: String, required: true }, // Kho nhập hàng
    // supplier: { type: String }, // Nhà cung cấp (nếu có)
    totalCost: { type: Number, required: true }, // Tổng giá trị của phiếu nhập kho
    note: { type: String }, // Ghi chú thêm
  },
  { timestamps: true }
);

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
