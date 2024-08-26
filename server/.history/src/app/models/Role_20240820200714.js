const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
// mongoose.plugin(slug);

mongoose.plugin(mongooseSlugUpdater);

const roleSchema = new Schema(
  {
    _id: { type: Number },
    name: { type: String, maxLength: 255, required: true },
  },

  { _id: false, timestamps: true }
);

// Add Plugins
roleSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
roleSchema.plugin(AutoIncrement);

module.exports = mongoose.model("Role", roleSchema);
