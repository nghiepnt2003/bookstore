const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;

// Định nghĩa schema cho Member
const memberSchema = new Schema(
  {
    _id: { type: Number },
    score: { type: Number, required: true, default: 0 },
    rank: { type: String, required: true, default: "Bronze" }, // Có thể thêm các giá trị mặc định như Bronze, Silver, Gold , Diamond
  },
  { timestamps: true }
);

// Add Plugins
memberSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
memberSchema.plugin(AutoIncrement, { id: "member_seq", inc_field: "_id" });

module.exports = mongoose.model("Member", memberSchema);
