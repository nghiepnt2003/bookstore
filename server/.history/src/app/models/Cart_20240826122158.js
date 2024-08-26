const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
// mongoose.plugin(slug);

mongoose.plugin(mongooseSlugUpdater);

const cartSchema = new Schema(
  {
    _id: { type: Number },
    items: [{ type: Number, ref: "LineItem" }],
    user: { type: Number, ref: "User", required: true },
  },

  { timestamps: true }
);

// Add Plugins
cartSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
cartSchema.plugin(AutoIncrement, { id: "cart_seq", inc_field: "_id" });

module.exports = mongoose.model("Cart", cartSchema);
