const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
// mongoose.plugin(slug);

mongoose.plugin(mongooseSlugUpdater);

const orderDetailSchema = new Schema(
  {
    _id: { type: Number },
    productId: { type: Number, required: true },
    productName: { type: String, maxLength: 255, required: true },
    productImage: { type: String, maxLength: 255, required: true },
    productPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },

  { timestamps: true }
);

// Add Plugins
orderDetailSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
orderDetailSchema.plugin(AutoIncrement, {
  id: "orderDetail_seq",
  inc_field: "_id",
});

module.exports = mongoose.model("OrderDetail", orderDetailSchema);
