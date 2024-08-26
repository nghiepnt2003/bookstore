const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
// mongoose.plugin(slug);

mongoose.plugin(mongooseSlugUpdater);

const userSchema = new Schema(
  {
    _id: { type: Number, required: true },
    date: { type: Date, required: true },
    comment: { type: String, maxLength: 1000 },
    rating: { type: Number, required: true },
    user: { type: ObjectId, ref: "User", required: true },
  },

  { _id: false, timestamps: true }
);

// Add Plugins
userSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
userSchema.plugin(AutoIncrement);

module.exports = mongoose.model("Feedback", userSchema);
