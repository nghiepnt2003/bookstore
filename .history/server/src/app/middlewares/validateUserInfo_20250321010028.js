const User = require("../models/User"); // Import User model

const validateUserInfo = async (req, res, next) => {
  try {
    const { username, email, phone, password } = req.body;

    // Kiểm tra các trường có bị thiếu không
    if (!username || !email || !phone || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập đầy đủ thông tin." });
    }

    // Kiểm tra định dạng email
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Email không hợp lệ." });
    }

    // Kiểm tra định dạng số điện thoại (10 số)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res
        .status(400)
        .json({ success: false, message: "Số điện thoại không hợp lệ." });
    }

    // Kiểm tra username đã tồn tại chưa
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res
        .status(400)
        .json({ success: false, message: "Username đã tồn tại." });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email đã được sử dụng." });
    }

    // Kiểm tra số điện thoại đã tồn tại chưa
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Số điện thoại đã được sử dụng.",
      });
    }

    next(); // Nếu tất cả hợp lệ, tiếp tục gửi OTP
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};

module.exports = validateUserInfo;
