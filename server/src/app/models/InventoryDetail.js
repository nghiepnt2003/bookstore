const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const mongooseDelete = require("mongoose-delete");
const Schema = mongoose.Schema;

const inventoryDetailSchema = new Schema(
  {
    _id: { type: Number }, // ID tự động tăng
    inventoryId: { type: Number, ref: "Inventory", required: true }, // Liên kết với Inventory
    productId: { type: Number, ref: "Product", required: true }, // Liên kết với Product
    quantity: { type: Number, required: true }, // Số lượng nhập
    unitCost: { type: Number, required: true }, // Giá nhập mỗi đơn vị
  },
  { timestamps: true }
);

// Add Plugins
inventoryDetailSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
inventoryDetailSchema.plugin(AutoIncrement, {
  id: "inventory_detail_seq",
  inc_field: "_id",
});

module.exports = mongoose.model("InventoryDetail", inventoryDetailSchema);
