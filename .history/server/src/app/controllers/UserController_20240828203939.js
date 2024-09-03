const User = require("../models/User");
const { multipleMongooseToObject } = require("../../util/mongoose");
const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
var jwt = require("jsonwebtoken");
var fs = require("fs");
const { checkDocumentById } = require("../middlewares/checkDocumentMiddleware");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/jwt");
class UserController {
  //[GET] /user/:id
  async getById(req, res) {
    try {
      let user = await User.findOne({ _id: req.params.id });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  }
  //[GET] /user/
  async getAll(req, res) {
    try {
      let userList = await User.find({});
      res.status(200).json(userList);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  // [POST] /user/register
  async register(req, res) {
    try {
      const { username, password, fullname, email, phone } = req.body;

      // thiếu role với cart
      if (!username || !password || !fullname || !email || !phone) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }

      const user = new User(req.body);
      const savedUser = await user.save();

      const newCart = new Cart({ user: savedUser._id, items: [] });
      const savedCart = await newCart.save();
      savedUser.cart = savedCart._id;
      await savedUser.save();
      // Trả về tài liệu đã lưu thành công
      res.status(200).json({
        success: true,
        message: "Create User successful",
        data: savedUser,
      });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ success: false, message: "An error occurred " + err });
    }
  }

  //[PUT] /user/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;

      // Kiểm tra sự tồn tại của tài liệu
      const check = await checkDocumentById(User, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }

      // Cập nhật user
      const updatedUser = await User.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.status(200).json({
        success: true,
        message: "User update successful",
        data: updatedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred : " + error,
      });
    }
  }

  //[DELETE] /user/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const check = await checkDocumentById(User, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }
      // Xóa Cart liên quan đến User trước khi xóa User
      await Cart.delete({ user: id });

      await User.delete({ _id: req.params.id });
      res.status(200).json({
        success: true,
        message: "Delete successful",
      });
      // res.redirect("back");
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred",
      });
    }
  }
  //[DELETE] /user/:id/force
  async forceDelete(req, res, next) {
    try {
      const { id } = req.params;
      // Xóa Cart liên quan đến User trước khi xóa User
      await Cart.deleteOne({ user: id });

      await User.deleteOne({ _id: id });
      res.status(200).json({
        success: true,
        message: "Delete Force successful",
      });
      // res.redirect("back");
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred",
      });
    }
  }
  // [PATCH] /user/:id/restore
  async restore(req, res, next) {
    try {
      const { id } = req.params;

      await User.restore({ _id: id });
      await Cart.restore({ _id: id });
      const restoredUser = await User.findById(req.params.id);
      console.log("Restored User:", restoredUser);
      res.status(200).json({
        status: "Successful",
        message: "Restored User",
        restoredUser,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  // RefreshToken : Chức năng dùng để cấp mới một accessToken khi accessToken cũ hết hạn
  // AccessToken => Xác thực, phân quyền người dùng
  // [POST] /user/login
  async login(req, res, next) {
    try {
      var { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }
      // Mỗi khi truy vấn bằng cú pháp mongooseDb
      // response trả về là một instance của mongooseDb
      // chứ không đơn giản là một object Data
      // Nếu muốn dùng object thuần (plain obj) thì dùng hàm toObject()
      const response = await User.findOne({ username });
      // Phải có else ở dưới vì khi không đúng mật khẩu thì hàm isCorrectPassword vẫn không sinh ra lỗi
      if (response && (await response.isCorrectPassword(password))) {
        // Phải dùng (plain Obj) để đưa instance mongooseDB về thành object thường
        const { password, role, ...userData } = response.toObject();
        //Tạo accessToken và refreshToken
        const accessToken = generateAccessToken(response._id, role);
        const refreshToken = generateRefreshToken(response._id);

        // Lưu refreshToken vào database
        // new : true : trả và data sau khi update
        await User.findByIdAndUpdate(
          response._id,
          { refreshToken },
          { new: true }
        );

        //Lưu refreshToken vào cookie
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          // secure: true, // Đảm bảo chỉ gửi cookie qua HTTPS trong môi trường production
          // sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        return res.status(200).json({ success: true, accessToken, userData });
      } else {
        res.status(500).json("Invalid credentials !!!");
      }
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "An error occurred : ", error });
    }
  }

  //[POST] /user/current
  async current(req, res, next) {
    try {
      const { _id } = req.user;
      const user = await User.findById(_id).select(
        "-refreshToken -password -role"
      );
      res
        .status(200)
        .json({ success: true, userData: user ? user : "User not found" });
    } catch (error) {
      next(error);
    }
  }

  //[PUT] /user/refreshAccessToken
  async refreshAccessToken(req, res, next) {
    try {
      // Lấy Refreshtoken từ cookies
      const cookie = req.cookies;
      // Check xem có tồn tại refreshToken hay không
      if (!cookie || !cookie.refreshToken)
        throw new Error("No refreshToken in cookies");
      var cert = fs.readFileSync("../key/publickey.crt");
      // Check xem refreshToken có hợp lệ hay không
      jwt.verify(
        cookie.refreshToken,
        cert,
        { algorithms: ["RS256"] },
        async (err, data) => {
          if (err) {
            return res.status(401).json({ success: false, message: err });
          }
          const response = await User.findOne({
            _id: data._id,
            refreshToken: cookie.refreshToken,
          });
          return res.status(200).json({
            success: response ? true : false,
            newAccessToken: response
              ? generateAccessToken(response._id, response.role)
              : "Refresh token not matched !!!",
          });
        }
      );
    } catch (error) {
      next(error);
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

  //[POST] /forgotPassword
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.query;
      if (!email) throw new Error("Missing email");
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found with this email");
      const resetToken = user.createPasswordChangeToken();
      await user.save();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
