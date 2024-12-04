const User = require("../models/User");

class UserService {
  // Lấy thông tin người dùng theo ID
  async getUserById(userId) {
    try {
      const user = await User.findOne({ _id: userId }).select(
        "-refreshToken -password"
      );
      return user;
    } catch (error) {
      throw new Error("Error fetching user: " + error.message);
    }
  }

  // Các phương thức nghiệp vụ khác có thể bổ sung vào đây nếu cần
}

module.exports = new UserService();
