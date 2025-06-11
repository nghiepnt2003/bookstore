const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
// mongoose.plugin(slug);

mongoose.plugin(mongooseSlugUpdater);

const authorSchema = new Schema(
  {
    _id: { type: Number },
    name: { type: String, maxLength: 255, require: true },
    description: { type: String },
    image: { type: String },
  },
  // Tự động thêm createdAt và updatedAt
  { timestamps: true }
);

// Add Plugins
authorSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
authorSchema.plugin(AutoIncrement, { id: "author_seq", inc_field: "_id" });

module.exports = mongoose.model("Author", authorSchema);
