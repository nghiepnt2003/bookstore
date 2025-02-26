const User = require("../models/User");
const { multipleMongooseToObject } = require("../../util/mongoose");
const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Member = require("../models/Member");
const cloudinary = require("cloudinary").v2;
const Cloud = require("../../config/cloud/cloudinary.config");

var jwt = require("jsonwebtoken");
var fs = require("fs");
const crypto = require("crypto");

const { checkDocumentById } = require("../middlewares/checkDocumentMiddleware");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/jwt");
const sendMail = require("../../util/sendMail");
const { saveOTP } = require("../models/OTP");
const Product = require("../models/Product");
const { OAuth2Client } = require("google-auth-library");
const userService = require("../services/userService");
const wishListService = require("../services/wishListService");
const client = new OAuth2Client(process.env.YOUR_GOOGLE_CLIENT_ID); // Client ID từ Google API

class UserController {
  //[GET] /user/:id
  async getById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.status(200).json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  //[GET] /user/
  async getAll(req, res) {
    try {
      const queries = { ...req.query };
      const { users, counts } = await userService.getAllUsers(queries);

      res.status(200).json({
        success: users.length > 0,
        counts,
        users: users.length > 0 ? users : "Cannot get users",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //[GET] /user/bookmark
  async getBookmarks(req, res) {
    try {
      const bookmarks = await userService.getBookmarksByUserId(req.user._id);

      res.status(200).json({
        success: true,
        bookmarks,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }
  //[GET] /user/addresses
  // async getAddresses(req, res) {
  //   try {
  //     const user = req.user; // Lấy thông tin user từ accessToken

  //     // Tìm thông tin người dùng và lấy danh sách địa chỉ
  //     const userInfo = await User.findById(user._id).select("address");

  //     if (!userInfo || !userInfo.address || userInfo.address.length === 0) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "No shipping addresses found",
  //       });
  //     }

  //     // Trả về danh sách địa chỉ của người dùng
  //     res.status(200).json({
  //       success: true,
  //       addresses: userInfo.address, // Danh sách địa chỉ
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message: "Failed to get shipping addresses",
  //       error: error.message,
  //     });
  //   }
  // }

  async generateRandomPhoneNumber() {
    let phoneNumber;
    let phoneExists = true;

    // Lặp lại việc tạo số điện thoại cho đến khi số này là duy nhất
    while (phoneExists) {
      phoneNumber = `0${Math.floor(100000000 + Math.random() * 90000000)}`; // Tạo chuỗi 10 số bắt đầu bằng 0
      phoneExists = await User.findOne({ phone: phoneNumber }); // Kiểm tra xem số này đã tồn tại chưa
    }

    return phoneNumber;
  }
  //[POST] /user/loginWithGoogle
  async loginWithGoogle(req, res) {
    try {
      const userInfo = req.user; // Lấy thông tin user từ Google

      // Đăng nhập và tạo người dùng mới nếu chưa tồn tại
      const user = await userService.loginWithGoogle(userInfo);

      // Tạo token cho user
      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);
      await User.findByIdAndUpdate(user._id, { refreshToken }, { new: true });

      // Lưu refreshToken vào cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });

      // Trả về thông tin người dùng
      const { password, role, ...userData } = user.toObject();
      res.status(200).json({
        success: true,
        message: "Login successful",
        accessToken,
        userData,
      });
    } catch (error) {
      console.error("Error during Google login", error);
      res.status(500).json({
        success: false,
        message: "An error occurred during login",
      });
    }
  }

  // [POST] /user/register
  async register(req, res) {
    try {
      const userData = req.body;

      // Gọi service để xử lý đăng ký
      const savedUser = await userService.register(userData);

      // Trả về kết quả thành công
      res.status(200).json({
        success: true,
        message: "Create User successful",
        data: savedUser,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        message: "An error occurred " + err.message,
      });
    }
  }
  //[GET] /product/wishlist
  async getWishlist(req, res) {
    try {
      const { _id } = req.user; // Lấy ID người dùng từ token

      // Gọi service để lấy wishlist
      const wishList = await wishListService.getWishlist(_id);

      // Trả về danh sách wishList
      return res.status(200).json({
        success: true,
        message: "wishList retrieved successfully",
        wishList, // Trả về danh sách sản phẩm trong wishList
      });
    } catch (error) {
      // Xử lý lỗi và trả về phản hồi
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
  // [POST] /product/:id/add-to-wishlist
  async addToWishlist(req, res) {
    try {
      const { _id } = req.user; // Lấy ID người dùng từ token
      const productId = req.params.id; // Lấy ID sản phẩm từ URL

      // Gọi service để thêm sản phẩm vào wishlist
      const wishList = await wishListService.addToWishlist(_id, productId);

      return res.status(200).json({
        success: true,
        message: "Product added to wishList",
        wishList, // Trả về danh sách wishlist đã được cập nhật
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message, // Lỗi từ service sẽ được xử lý ở đây
      });
    }
  }

  //[PUT] /user/
  async update(req, res, next) {
    try {
      const result = await userService.updateUserProfile(req);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred : " + error,
      });
    }
  }
  //[PUT] /user/:uid
  async updateByAdmin(req, res, next) {
    try {
      const result = await userService.updateUserByAdmin(req);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred : " + error,
      });
    }
  }

  //[DELETE] /user/:id
  async delete(req, res, next) {
    try {
      const result = await userService.deleteUserById(req);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred : " + error,
      });
    }
  }
  // [DELETE] /user/wishlist/:productId
  async removeFromWishlist(req, res) {
    try {
      const result = await userService.removeFromWishlist(req);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  // [DELETE] /user/wishlist/removeAll
  async removeAllFromWishlist(req, res) {
    try {
      const result = await userService.removeAllFromWishlist(req);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  //[DELETE] /user/:id/force
  async forceDelete(req, res) {
    try {
      const result = await userService.forceDelete(req);
      res.status(result.status).json(result.response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }
  // [PATCH] /user/:id/restore
  async restore(req, res, next) {
    try {
      const { id } = req.params;

      // Gọi service để khôi phục người dùng và giỏ hàng
      const restoredUser = await userService.restoreUserAndCart(id);

      // Trả về phản hồi thành công
      res.status(200).json({
        status: true,
        message: "Restored User",
        restoredUser,
      });
    } catch (error) {
      // Xử lý lỗi và trả về phản hồi lỗi
      res.status(500).json({
        success: false,
        message: error.message || "An error occurred",
      });
    }
  }

  // RefreshToken : Chức năng dùng để cấp mới một accessToken khi accessToken cũ hết hạn
  // AccessToken => Xác thực, phân quyền người dùng
  // [POST] /user/login
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }

      // Gọi service để thực hiện đăng nhập
      const { accessToken, refreshToken, user } = await userService.login(
        username,
        password
      );

      // Lưu refreshToken vào cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });

      // Trả về kết quả
      const { password: userPassword, role, ...userData } = user.toObject(); // Đổi tên password thành userPassword
      userData.role = role;

      return res.status(200).json({
        success: true,
        accessToken,
        userData,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "An error occurred",
      });
    }
  }

  //[POST] /user/current
  async current(req, res, next) {
    try {
      const { _id } = req.user; // Lấy userId từ thông tin xác thực trong request
      const user = await userService.getCurrentUser(_id); // Gọi service để lấy người dùng

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        userData: user, // Trả về thông tin người dùng đã được lọc
      });
    } catch (error) {
      next(error); // Truyền lỗi cho middleware xử lý lỗi
    }
  }

  //[PUT] /user/refreshAccessToken
  async refreshAccessToken(req, res, next) {
    try {
      // Lấy refresh token từ cookie
      const cookie = req.cookies;

      // Kiểm tra xem có refresh token trong cookie không
      if (!cookie || !cookie.refreshToken) {
        return res.status(400).json({
          success: false,
          message: "No refresh token in cookies",
        });
      }

      // Gọi service để làm mới access token
      const { success, newAccessToken } = await userService.refreshAccessToken(
        cookie.refreshToken
      );

      if (success) {
        return res.status(200).json({
          success: true,
          newAccessToken,
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }
    } catch (error) {
      next(error); // Truyền lỗi cho middleware xử lý lỗi
    }
  }

  //[PUT] /user/logout
  async logout(req, res, next) {
    try {
      const cookie = req.cookies;
      // Check xem có tồn tại refreshToken hay không(nếu ko có thì có nghĩa chưa đăng nhập)
      if (!cookie || !cookie.refreshToken) {
        throw new Error("No Refresh Token in cookies");
      }
      // xóa refreshToken trong db
      await User.findOneAndUpdate(
        { refreshToken: cookie.refreshToken },
        { refreshToken: "" },
        { new: true }
      );
      // xóa refreshToken trong cookie trình duyệt
      res.clearCookie("refreshToken", { httpOnly: true, secure: true });
      res.status(200).json({ success: true, message: "Logout successful" });
    } catch (error) {
      next(error);
    }
  }

  // Client  gửi email
  // server check mail => hợp lệ Gửi mail(gửi thư) + link (password change token)
  // client check mail do server gửi => click link
  // client gửi 1 api kèm theo token (password change token)
  // Server check token có giống với token mà server gửi mail hay không ?
  // Check thấy giống thì cho đổi password

  //[GET] /forgotPassword/:email
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.query;
      if (!email)
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found with this email");
      const resetToken = user.createPasswordChangeToken();
      await user.save();

      // const html = `Xin vui lòng click vào đường link dưới đây để thay đổi mật khẩu của bạn.
      // Link này sẽ hết hạn sau 15 phút kể từ bây giờ. <a href=${process.env.URL_SERVER}/user/resetPassword/${resetToken}>Click here</a> `;
      const html = `<!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Xác nhận thay đổi mật khẩu</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 14px;
                        color: #333333;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        border: 5px solid #39c6b9;
                        border-radius: 10px;
                    }
                    .content {
                        padding: 20px;
                    }
                    h1 {
                        color: #39c6b9;
                    }
                    p {
                        line-height: 1.5;
                    }
                    a {
                        color: #0099ff;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="content">
                        <h1>Book Store</h1>
                        <p>Xin chào, <span style="font-weight: bold;">${user?.username}</span>!</p>
                        <p>Xin vui lòng click vào đường link dưới đây để thay đổi mật khẩu của bạn.</p>
                        <p>Link này sẽ hết hạn sau 15 phút kể từ bây giờ. </p>
                        <strong style="color: #da4f25;"><a href=${process.env.URL_CLIENT}/reset-password/${resetToken}>Click here</a></strong>
                        <p>Cảm ơn bạn đã tin tưởng sử dụng web của chúng tôi!</p>
                        <p>Trân trọng,</p>
                        <p>Book Store</p>
                    </div>
                </div>
            </body>
            </html>`;
      const data = {
        email,
        html,
      };
      const result = await sendMail("ForgotPassword", data);
      res.status(200).json({ success: true, result });
    } catch (error) {
      next(error);
    }
  }
  //[GET] /sendOTPCreateAccount/
  async sendOTPCreateAccount(req, res, next) {
    try {
      const { email } = req.query;

      if (!email)
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      let user = await User.findOne({ email });
      // Tạo tài khoản thì ms cần check email exist để loại
      if (user)
        return res.status(400).json({
          success: false,
          message: "User with this email already exists !!!",
        });
      let otp_code = Math.floor(100000 + Math.random() * 900000).toString();
      // Lưu OTP vào cơ sở dữ liệu
      await saveOTP(email, otp_code); // Hàm saveOTP bạn đã định nghĩa

      const html = `<!DOCTYPE html>
              <html lang="vi">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Xác nhận OTP</title>
                  <style>
                      body {
                          font-family: Arial, sans-serif;
                          font-size: 14px;
                          color: #333333;
                          margin: 0;
                          padding: 0;
                      }
                      .container {
                          max-width: 600px;
                          margin: 0 auto;
                          border: 5px solid #39c6b9;
                          border-radius: 10px;
                      }
                      .content {
                          padding: 20px;
                      }
                      h1 {
                          color: #39c6b9;
                      }
                      p {
                          line-height: 1.5;
                      }
                      a {
                          color: #0099ff;
                          text-decoration: none;
                      }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <div class="content">
                          <h1>Book Store</h1>
                          <p>Xin chào,</p>
                          <p>Đây là mã OTP để tạo tài khoản của bạn.</p>
                          <strong style="color: #da4f25;">OTP : ${otp_code}</strong>
                          <p>Cảm ơn bạn đã tin tưởng sử dụng web của chúng tôi!</p>
                          <p>Trân trọng,</p>
                          <p>Book Store</p>
                      </div>
                  </div>
              </body>
              </html>`;
      const data = {
        email,
        html,
      };
      const result = await sendMail("Create Account", data);
      if (!result) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to send OTP email." });
      }

      res
        .status(200)
        .json({ success: true, message: "OTP sent successfully.", result });
    } catch (error) {
      next(error);
    }
  }

  //[PUT]/address/
  async addUserAddress(req, res, next) {
    try {
      const { _id } = req.user;
      if (!req.body.address) throw new Error("Missing input address");
      const response = await User.findByIdAndUpdate(
        _id,
        { $push: { address: req.body.address } },
        { new: true }
      ).select("-password -role -refreshToken");
      res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : "Something went wrong !!!",
      });
    } catch (error) {
      next(error);
    }
  }
  // [PUT] /address/:index
  async updateUserAddress(req, res, next) {
    try {
      const { _id } = req.user;
      const { index } = req.params; // Lấy index của địa chỉ từ params
      const { address } = req.body; // Địa chỉ mới từ body

      if (!address) throw new Error("Missing input address");

      // Cập nhật địa chỉ trong mảng
      const response = await User.findByIdAndUpdate(
        _id,
        { $set: { [`address.${index}`]: address } }, // Sử dụng $set để cập nhật địa chỉ tại index
        { new: true }
      ).select("-password -role -refreshToken");

      res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : "Something went wrong !!!",
      });
    } catch (error) {
      next(error);
    }
  }

  // [PUT] /user/:id/block
  async blockUser(req, res) {
    try {
      const { id } = req.params; // ID của user cần block
      const { isBlocked } = req.body; // Trạng thái block

      // Kiểm tra user có tồn tại hay không
      const user = await User.findById(id).select(
        "-password -refreshToken -role"
      );
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      // Kiểm tra nếu role của user là admin
      if (user.role === 1) {
        return res.status(403).json({
          success: false,
          message: "Cannot block an admin user",
        });
      }
      // Cập nhật trạng thái block của user
      user.isBlocked = isBlocked ? isBlocked : false;
      await user.save();

      res.status(200).json({
        success: true,
        message: isBlocked
          ? "User blocked successfully"
          : "User unblocked successfully",
        data: user,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  // [DELETE] /address/:index
  async deleteUserAddress(req, res, next) {
    try {
      const { _id } = req.user;
      const index = req.params.index;

      // Kiểm tra xem index có phải là một số và nằm trong phạm vi mảng địa chỉ không
      if (isNaN(index) || index < 0) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid address index" });
      }

      const user = await User.findById(_id);

      // Kiểm tra xem người dùng có địa chỉ nào không
      if (!user || !user.address || user.address.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No addresses found" });
      }

      // Kiểm tra xem index có vượt quá độ dài của mảng không
      if (index >= user.address.length) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid address index" });
      }

      // Cập nhật địa chỉ
      const updatedAddress = user.address.filter((_, i) => i !== Number(index));

      // Lưu địa chỉ đã cập nhật vào cơ sở dữ liệu
      user.address = updatedAddress;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Address deleted successfully",
        updatedAddress: user.address,
      });
    } catch (error) {
      next(error);
    }
  }
  // Dùng khi quên mật khẩu
  //[PUT] /resetPassword/
  async resetPassword(req, res, next) {
    try {
      const { resetToken, newPassword } = req.body;
      if (!resetToken || !newPassword)
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });

      const passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      const user = await User.findOne({
        passwordResetToken,
        //kiểm tra xem thời gian reset Password có lớn hơn tg hiện tại ko
        // có thì mới tìm thấy user để đổi pass
        passwordResetExpires: { $gt: Date.now() },
      });
      if (!user) throw new Error("Invalid reset token");
      user.password = newPassword;
      user.passwordChangedAt = Date.now();
      user.passwordResetExpires = undefined;
      user.passwordResetToken = undefined;
      await user.save();
      res.status(200).json({
        success: user ? true : false,
        message: user ? "Updated Password" : "Something went wrong !!",
      });
    } catch (error) {
      next(error);
    }
  }

  // Dùng để đổi mật khẩu: Được sử dụng khi người dùng đã đăng nhập và nhớ mật khẩu cũ, muốn đổi sang mật khẩu mới.
  // [PUT] /changePassword/
  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user._id; // Lấy user ID từ token hoặc session sau khi đăng nhập
      if (!oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Nhập thiếu thông tin" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Người dùng không tồn tại" });
      }

      // Kiểm tra mật khẩu cũ
      const isCorrectOldPassword = await user.isCorrectPassword(oldPassword);
      if (!isCorrectOldPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Mật khẩu cũ không chính xác" });
      }
      // Kiểm tra mật khẩu mới có trùng với mật khẩu cũ không
      const isSameAsOldPassword = await user.isCorrectPassword(newPassword);
      if (isSameAsOldPassword) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu mới không được trùng với mật khẩu cũ",
        });
      }
      // Cập nhật mật khẩu mới
      user.password = newPassword;
      user.passwordChangedAt = Date.now();
      await user.save();

      res.status(200).json({
        success: true,
        message: "Cập nhật mật khẩu mới thành công",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
