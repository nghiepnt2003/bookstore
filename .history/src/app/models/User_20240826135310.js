const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

// mongoose.plugin(slug);

mongoose.plugin(mongooseSlugUpdater);

const userSchema = new Schema(
  {
    _id: { type: Number },
    username: { type: String, maxLength: 255, required: true },
    password: { type: String, required: true },
    fullname: { type: String, maxLength: 255, required: true },
    email: { type: String, maxLength: 255, required: true, unique: true },
    phone: { type: String, maxLength: 20, unique: true },
    address: { type: String, maxLength: 500 },
    role: { type: Number, ref: "Role", required: true, default: 2 },
    isBlocked: { type: Boolean, default: false },
    wishList: [{ type: Number, ref: "Product" }],
    cart: { type: Number, ref: "Cart" },
    refreshToken: { type: String },
    passwordChangedAt: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: String },
  },

  { timestamps: true }
);
// Khi định nghĩa hàm bên trong model của mongoose thì không
// thể dùng arrow function

userSchema.pre("save", async function (next) {
  // nếu có chỉnh sửa thì hash
  if (this.isModified("password")) {
    console.log(123123213213213123213);
    const salt = bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    const salt = bcrypt.genSaltSync(10);
    update.password = await bcrypt.hash(update.password, salt);
  }
  next();
});

// Add Plugins
userSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
userSchema.plugin(AutoIncrement, { id: "user_seq", inc_field: "_id" });

module.exports = mongoose.model("User", userSchema);
