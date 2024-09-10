const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const { Payment } = require("./Payment");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
// mongoose.plugin(slug);

mongoose.plugin(mongooseSlugUpdater);

const orderSchema = new Schema(
  {
    _id: { type: Number },
    details: [{ type: Number, ref: "OrderDetail" }],
    date: { type: Date, required: true },
    status: { type: String, maxLength: 255, required: true },
    totalPrice: { type: Number, required: true, default: Payment.OFFLINE },
    payment: { type: String, enum: Object.values(Payment) },
    user: { type: Number, ref: "User", required: true },
  },

  { timestamps: true }
);

// Add Plugins
orderSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
orderSchema.plugin(AutoIncrement, { id: "order_seq", inc_field: "_id" });

module.exports = mongoose.model("Order", orderSchema);
