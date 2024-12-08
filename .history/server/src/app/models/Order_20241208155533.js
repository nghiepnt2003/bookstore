const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const mongooseSlugUpdater = require("mongoose-slug-updater");
var mongooseDelete = require("mongoose-delete");
const { Payment } = require("./Payment");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
// mongoose.plugin(slug);

mongoose.plugin(mongooseSlugUpdater);

const orderSchema = new Schema(
  {
    _id: { type: Number },
    recipientName: { type: String, required: true },
    recipientPhone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); // kiểm tra nếu chuỗi số điện thoại có đúng 10 số
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    details: [{ type: Number, ref: "OrderDetail" }],
    date: { type: Date, required: true },
    status: {
      type: String,
      default: "Not Yet Paid",
      enum: [
        "Not Yet Paid",
        "Pending",
        "Awaiting",
        "Cancelled",
        "Delivering",
        "Transported",
        "Successed",
      ],
    },
    totalPrice: { type: Number, required: true },
    payment: {
      type: String,
      enum: Object.values(Payment),
      default: Payment.OFFLINE,
    },
    // payment: {
    //   type: String,
    //   enum: ["MOMO", "VN_PAY", "OFFLINE"],
    //   default: "OFFLINE",
    // },

    user: { type: Number, ref: "User", required: true },
    shippingAddress: { type: String, required: true },
  },

  { timestamps: true }
);

// Add Plugins
orderSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});
orderSchema.plugin(AutoIncrement, { id: "order_seq", inc_field: "_id" });

module.exports = mongoose.model("Order", orderSchema);

/*
Pending (Chờ xử lý): Đơn hàng đã được tạo, nhưng chưa được xác nhận hoặc xử lý.
Confirmed (Đã xác nhận): Đơn hàng đã được xác nhận và chuẩn bị xử lý.
Processing (Đang xử lý): Đơn hàng đang trong quá trình chuẩn bị hoặc đóng gói.
Shipped (Đã giao hàng): Đơn hàng đã được vận chuyển và đang trên đường đến người nhận.
Delivered (Đã giao): Đơn hàng đã được giao thành công đến khách hàng.
Cancelled (Đã hủy): Đơn hàng bị hủy trước khi hoàn thành.
Returned (Đã trả hàng): Khách hàng đã trả lại đơn hàng sau khi nhận hàng.
Refunded (Đã hoàn tiền): Đơn hàng đã được trả hàng và hoàn tiền cho khách hàng.
Failed (Thất bại): Đơn hàng không thể hoàn thành do lỗi thanh toán hoặc lý do khác.
*/
