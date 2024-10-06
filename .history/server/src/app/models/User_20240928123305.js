const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const crypto = require("crypto");
const ObjectId = Schema.ObjectId;

// mongoose.plugin(slug);

mongoose.plugin(mongooseSlugUpdater);

const userSchema = new Schema(
  {
    _id: { type: Number },
    username: { type: String, maxLength: 255, required: true, unique: true },
    password: { type: String, required: true },
    fullname: { type: String, maxLength: 255, required: true },
    // email: { type: String, maxLength: 255, required: true, unique: true },
    // phone: { type: String, maxLength: 20, unique: true, require: true },
    email: {
      type: String,
      maxLength: 255,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          // Regex kiểm tra định dạng email
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); // kiểm tra nếu chuỗi số điện thoại có đúng 10 số
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
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
// Trước khi save
userSchema.pre("save", async function (next) {
  // nếu có chỉnh sửa thì hash
  if (this.isModified("password")) {
    const salt = bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});
// Trước khi findOneAndUpdate
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    const salt = bcrypt.genSaltSync(10);
    update.password = await bcrypt.hash(update.password, salt);
  }
  next();
});

// kiểm tra password
userSchema.methods = {
  isCorrectPassword: async function (password) {
    return await bcrypt.compare(password, this.password);
  },
  createPasswordChangeToken: function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    return resetToken;
  },
};

// Add Plugins
userSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
userSchema.plugin(AutoIncrement, { id: "user_seq", inc_field: "_id" });

module.exports = mongoose.model("User", userSchema);
