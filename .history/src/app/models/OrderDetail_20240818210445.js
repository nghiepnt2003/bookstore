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
    _id: { type: Number, required: true },
    productId: { type: Number, required: true },
    productName: { type: String, maxLength: 255, required: true },
    productImage: { type: String, maxLength: 255, required: true },
    productPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },

  { _id: false, timestamps: true }
);

// Add Plugins
orderDetailSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
orderDetailSchema.plugin(AutoIncrement);

module.exports = mongoose.model("Order", orderDetailSchema);
