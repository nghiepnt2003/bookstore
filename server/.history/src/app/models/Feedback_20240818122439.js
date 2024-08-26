const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
// mongoose.plugin(slug);

mongoose.plugin(mongooseSlugUpdater);

const feedbackSchema = new Schema(
  {
    _id: { type: Number, required: true },
    date: { type: Date, required: true },
    comment: { type: String, maxLength: 1000 },
    rating: { type: Number, required: true },
    user: { type: ObjectId, ref: "User", required: true },
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
feedbackSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
feedbackSchema.plugin(AutoIncrement);

module.exports = mongoose.model("Feedback", feedbackSchema);
