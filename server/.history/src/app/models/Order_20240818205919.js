const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
// mongoose.plugin(slug);

mongoose.plugin(mongooseSlugUpdater);

const orderSchema = new Schema(
  {
    _id: { type: Number, required: true },
    details: [{ type: ObjectId, ref: "OrderDetail", required: true }],
    date: { type: Date, required: true },
    status: { type: String, maxLength: 255, required: true },
    totalPrice: { type: Number, required: true },
    payment: { type: String, enum: Object.values(Payment), required: true },
    user: { type: ObjectId, ref: "User", required: true },
  },

  { _id: false, timestamps: true }
);

// Add Plugins
orderSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
orderSchema.plugin(AutoIncrement);

module.exports = mongoose.model("Order", orderSchema);
