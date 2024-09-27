const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true }, // Thay đổi userId thành email
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// Tạo chỉ mục cho expiresAt để dễ dàng tìm kiếm OTP đã hết hạn
otpSchema.index({ expiresAt: 1 });

const OtpModel = mongoose.model("Otp", otpSchema);

// Lưu OTP
const saveOTP = async (email, otp) => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Thời gian hết hạn (5 phút)

  // Cập nhật hoặc tạo mới OTP cho email
  await OtpModel.findOneAndUpdate(
    { email },
    { otp, expiresAt },
    { upsert: true } // Tạo mới nếu không tìm thấy
  );

  console.log("OTP saved successfully");
};

// Kiểm tra OTP
const verifyOTP = async (email, inputOtp) => {
  const otpEntry = await OtpModel.findOne({ email });
  if (!otpEntry || otpEntry.expiresAt < new Date()) {
    return false; // OTP không tồn tại hoặc đã hết hạn
  }
  return otpEntry.otp === inputOtp; // So sánh OTP
};

module.exports = { OtpModel, saveOTP, verifyOTP };
