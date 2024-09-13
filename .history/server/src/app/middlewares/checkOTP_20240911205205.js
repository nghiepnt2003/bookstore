const checkOTPCreateAccount = async (req, res, next) => {
  try {
    const { otp } = req.body;
    if (!otp)
      return res.status(400).json({ success: false, message: "Missing OTP " });

    if (req.session.otp && req.session.otp.expires > Date.now()) {
      if (req.session.otp.value === otp) {
        next();
      } else {
        // OTP không chính xác
        res.status(400).json({ success: false, message: "OTP not match " });
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
