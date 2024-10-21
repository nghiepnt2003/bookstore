const mongoose = require("mongoose");
// var slug = require("mongoose-slug-generator");
const Schema = mongoose.Schema;

const otpSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const OtpModel = mongoose.model("Otp", otpSchema);
// Lưu OTP
const saveOTP = async (userId, otp) => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Thời gian hết hạn (5 phút)
  const otpEntry = new OtpModel({ userId, otp, expiresAt });
  await otpEntry.save();
  console.log("OTP saved successfully");
};

// Kiểm tra OTP
const verifyOTP = async (userId, inputOtp) => {
  const otpEntry = await OtpModel.findOne({ userId });
  if (!otpEntry || otpEntry.expiresAt < new Date()) {
    return false; // OTP không tồn tại hoặc đã hết hạn
  }
  return otpEntry.otp === inputOtp; // So sánh OTP
};

module.exports = OtpModel;