const { verifyOTP } = require("../models/Otp");

const checkOTP = async (req, res, next) => {
  const { email, otp } = req.body; // Lấy email và OTP từ yêu cầu
  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email và OTP là bắt buộc." });
  }

  try {
    const result = await verifyOTP(email, otp);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    // Nếu OTP hợp lệ, tiếp tục với request
    next();
  } catch (error) {
    console.error("Error in checkOTP ", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi trong quá trình xác thực OTP." });
  }
};

module.exports = checkOTP;
