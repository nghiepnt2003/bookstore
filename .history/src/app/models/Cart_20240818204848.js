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
    _id: { type: Number, required: true },
    items: [{ type: ObjectId, ref: "LineItem", required: true }],
    user: { type: ObjectId, ref: "User", required: true },
  },

  { _id: false, timestamps: true }
);

// Add Plugins
lineItemSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
lineItemSchema.plugin(AutoIncrement);

module.exports = mongoose.model("LineItem", lineItemSchema);
