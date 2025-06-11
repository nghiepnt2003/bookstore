const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// Tạo chỉ mục cho expiresAt để dễ dàng tìm kiếm OTP đã hết hạn
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpModel = mongoose.model("Otp", otpSchema);

// Lưu OTP
const saveOTP = async (email, otp) => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Thời gian hết hạn (5 phút)

  try {
    // Cập nhật hoặc tạo mới OTP cho email
    await OtpModel.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true } // Tạo mới nếu không tìm thấy
    );
    console.log("OTP saved successfully");
  } catch (error) {
    console.error("Error saving OTP:", error);
    throw new Error("Failed to save OTP");
  }
};

// Kiểm tra OTP
const verifyOTP = async (email, inputOtp) => {
  try {
    const otpEntry = await OtpModel.findOne({ email });

    // Kiểm tra xem OTP có tồn tại không và có hết hạn không
    if (!otpEntry) {
      return { success: false, message: "OTP không tồn tại." };
    }
    if (otpEntry.expiresAt < new Date()) {
      return { success: false, message: "OTP đã hết hạn." };
    }

    // So sánh OTP
    const isMatch = otpEntry.otp === inputOtp;
    return {
      success: isMatch,
      message: isMatch ? "OTP hợp lệ." : "OTP không chính xác.",
    };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, message: "Lỗi khi kiểm tra OTP." };
  }
};

module.exports = { OtpModel, saveOTP, verifyOTP };
