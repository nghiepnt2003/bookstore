const mongoose = require("mongoose");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

mongoose.plugin(mongooseSlugUpdater);

const messageSchema = new Schema(
  {
    _id: { type: Number },
    sender: { type: Number, ref: "User", required: true }, // Người gửi tin nhắn
    receiver: { type: Number, ref: "User", required: true }, // Người nhận tin nhắn
    content: { type: String, maxLength: 1000 }, // Nội dung tin nhắn (text)
    images: [{ type: String }],
    isRead: { type: Boolean, default: false }, // Trạng thái đã đọc
  },
  // Tự động thêm createdAt và updatedAt
  { timestamps: true }
);

// Add Plugins
messageSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
messageSchema.plugin(AutoIncrement, { id: "message_seq", inc_field: "_id" });

module.exports = mongoose.model("Message", messageSchema);
