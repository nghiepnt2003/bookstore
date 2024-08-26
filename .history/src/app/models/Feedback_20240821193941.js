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
    _id: { type: Number },
    date: { type: Date, required: true },
    comment: { type: String, maxLength: 1000 },
    rating: { type: Number, required: true },
    user: { type: ObjectId, ref: "User", required: true },
  },

  { timestamps: true }
);

// Add Plugins
feedbackSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
feedbackSchema.plugin(AutoIncrement, { id: "feedback_seq", inc_field: "_id" });

module.exports = mongoose.model("Feedback", feedbackSchema);
