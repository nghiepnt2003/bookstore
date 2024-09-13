const checkOTPCreateAccount = async (req, res, next) => {
  try {
    if (req.session.otp && req.session.otp.expires > Date.now()) {
      if (req.session.otp.value === otp) {
        // OTP chính xác
        res.status(200).send("OTP is valid");
      } else {
        // OTP không chính xác
        res.status(400).send("Invalid OTP");
      }
    } else {
      // OTP đã hết hạn hoặc không tồn tại
      res.status(400).send("OTP has expired or not found");
    }
  } catch (error) {
    next(error);
  }
};
module.exports = { checkOTPCreateAccount };
