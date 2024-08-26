const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
// mongoose.plugin(slug);

mongoose.plugin(mongooseSlugUpdater);

const publisherSchema = new Schema(
  {
    _id: { type: Number, required: true },
    name: { type: String, maxLength: 255, required: true },
    description: { type: String, maxLength: 600 },
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
publisherSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
publisherSchema.plugin(AutoIncrement);
publisherSchema.plugin(AutoIncrement, {
  id: "publisher_seq",
  inc_field: "_id",
});

module.exports = mongoose.model("Publisher", publisherSchema);
