const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
// mongoose.plugin(slug);

mongoose.plugin(mongooseSlugUpdater);

const categorySchema = new Schema(
  {
    _id: { type: Number, required: true },
    name: { type: String, maxLength: 255, required: true },
  },

  { _id: false, timestamps: true }
);

// Custom Query helpers
// authorSchema.query.sortable = function (req) {
//   if (req.query.hasOwnProperty("_sort")) {
//     const isValidType = ["asc", "desc"].includes(req.query.type);
//     return this.sort({
//       [req.query.column]: isValidType ? req.query.type : "desc",
//     });
//   }
//   return this;
// };

// Add Plugins
categorySchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
categorySchema.plugin(AutoIncrement);

module.exports = mongoose.model("Category", categorySchema);
