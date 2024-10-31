const User = require("../models/User");
const { multipleMongooseToObject } = require("../../util/mongoose");
const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
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
const client = new OAuth2Client(process.env.YOUR_GOOGLE_CLIENT_ID); // Client ID từ Google API

class UserController {
  //[GET] /user/:id
  async getById(req, res) {
    try {
      let user = await User.findOne({ _id: req.params.id }).select(
        "-refreshToken -password "
      );
      res.status(200).json({ success: user ? true : false, user });
    } catch (error) {
      res.status(500).json(error);
    }
  }
  //[GET] /user/
  async getAll(req, res) {
    try {
      const queries = { ...req.query };
      // Tách các trường đặc biệt ra khỏi query
      const excludeFields = ["limit", "sort", "page", "fields"];
      excludeFields.forEach((el) => delete queries[el]);

      // Format lại các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(queries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      // Filtering
      if (queries?.username) {
        formatedQueries.username = { $regex: queries.username, $options: "i" };
      }
      if (queries?.email) {
        formatedQueries.email = { $regex: queries.email, $options: "i" };
      }
      if (queries?.fullname) {
        formatedQueries.fullname = { $regex: queries.fullname, $options: "i" };
      }

      // Execute query
      // let queryCommand = User.find(formatedQueries);
      let queryCommand = User.find(formatedQueries).populate({
        path: "wishList", // Populate trường wishList
        select: "name image price author publisher categories", // Chỉ lấy những trường cần thiết
        populate: [
          { path: "author", select: "name" }, // Populate thêm các trường liên quan như author
          { path: "publisher", select: "name" }, // Populate thêm trường publisher
          { path: "categories", select: "name" }, // Populate thêm categories
        ],
      });

      // Sorting
      if (req.query.sort) {
        // abc,exg => [abc,exg] => "abc exg"
        const sortBy = req.query.sort.split(",").join(" ");
        // sort lần lượt bởi publisher author category nếu truyền  sort("publisher author categories")
        queryCommand = queryCommand.sort(sortBy);
      }

      // fields limiting
      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      //Pagination
      // limit: số docs lấy về 1 lần gọi API
      // skip:
      // Dấu + nằm trước số để chuyển sang số
      // +'2' => 2
      // +'asdasd' => NaN
      const page = +req.query.page || 1;
      const limit = +req.query.limit || process.env.LIMIT_USERS;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit).select("-refreshToken -password ");
      // -refreshToken -password -role

      // Lấy danh sách sản phẩm
      const response = await queryCommand.exec();

      // Lấy số lượng sản phẩm
      const counts = await User.find(formatedQueries).countDocuments();

      res.status(200).json({
        success: response.length > 0,
        counts,
        users: response.length > 0 ? response : "Cannot get user",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }

    // try {
    //   const response = await User.find({}).select(
    //     "-refreshToken -password -role"
    //   );
    //   res
    //     .status(200)
    //     .json({ success: response ? true : false, users: response });
    // } catch (error) {
    //   res.status(500).json(error);
    // }
  }
  //[GET] /user/addresses
  // API lấy danh sách địa chỉ của người dùng
  async getAddresses(req, res) {
    try {
      const user = req.user; // Lấy thông tin user từ accessToken

      // Tìm thông tin người dùng và lấy danh sách địa chỉ
      const userInfo = await User.findById(user._id).select("address");

      if (!userInfo || !userInfo.address || userInfo.address.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No shipping addresses found",
        });
      }

      // Trả về danh sách địa chỉ của người dùng
      res.status(200).json({
        success: true,
        addresses: userInfo.address, // Danh sách địa chỉ
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get shipping addresses",
        error: error.message,
      });
    }
  }

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
      const userInfo = req.user;
      const email = userInfo.email;
      console.log("userifoo", userInfo);
      // Kiểm tra nếu user đã tồn tại trong database
      let user = await User.findOne({ email });

      // Nếu user chưa tồn tại, tạo mới
      if (!user) {
        const randomPhone = await this.generateRandomPhoneNumber();
        const newUser = new User({
          username: email.split("@")[0], // Dùng phần đầu của email làm username
          fullname: userInfo.name,
          email,
          phone: randomPhone,
          address: "", // Có thể cho mặc định nếu không lấy từ Google
          password: userInfo._id, // Google login không cần mật khẩu
          role: 2, // Gán vai trò mặc định (nếu có)
        });
        const savedUser = await newUser.save();
        // Tạo mới cart cho user
        const newCart = new Cart({ user: savedUser._id, items: [] });
        const savedCart = await newCart.save();
        savedUser.cart = savedCart._id;

        // Lưu user mới vào database
        user = await savedUser.save();

        // Gửi email chào mừng (nếu có)
        // const html = `<!DOCTYPE html> ...`; // HTML content email
        // await sendMail("Create account successfully", { email, html });
      }

      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);
      await User.findByIdAndUpdate(user._id, { refreshToken }, { new: true });
      //Lưu refreshToken vào cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        // secure: true, // Đảm bảo chỉ gửi cookie qua HTTPS trong môi trường production
        // sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });
      const { password, role, ...userData } = user.toObject();
      // Trả về thông tin người dùng
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
      const { username, password, fullname, email, phone, address } = req.body;

      // thiếu role với cart
      if (!username || !password || !fullname || !email || !phone) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Username already exists." });
      }

      const user = new User(req.body);
      const savedUser = await user.save();

      const newCart = new Cart({ user: savedUser._id, items: [] });
      const savedCart = await newCart.save();
      savedUser.cart = savedCart._id;
      await savedUser.save();
      // Trả về tài liệu đã lưu thành công
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
                        <p>Xin chào!</p>
                        <p>Chúng tôi rất vui mừng thông báo rằng tài khoản của bạn tại Bookstore đã được đăng ký thành công! 🎉Hân hạnh chào đón bạn gia nhập cộng đồng yêu sách tại cửa hàng trực tuyến của chúng tôi.🎉🎉🎉</p>
                        <p>Xin chúc bạn có những trải nghiệm tuyệt vời khi mua sách tại bookstore</p>
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
      const result = await sendMail("Create account successfully", data);

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
  //[GET] /product/wishlist
  async getWishlist(req, res) {
    try {
      const { _id } = req.user; // Lấy ID của user từ token

      // Lấy thông tin user
      const user = await User.findById(_id).populate({
        path: "wishList",
        populate: [
          { path: "author", select: "name" }, // Populate thông tin author
          { path: "publisher", select: "name" }, // Populate thông tin publisher
          { path: "categories", select: "name" }, // Populate thông tin category
        ],
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "wishList retrieved successfully",
        wishList: user.wishList, // Trả về danh sách sản phẩm trong wishList
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }
  // [POST] /product/:id/add-to-wishlist
  async addToWishlist(req, res) {
    try {
      const { _id } = req.user;
      const productId = req.params.id;

      // Kiểm tra sự tồn tại của sản phẩm
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Lấy thông tin user
      const user = await User.findById(_id);
      if (!Array.isArray(user.wishList)) {
        user.wishList = [];
      }
      // Kiểm tra xem sản phẩm đã có trong wishList chưa
      if (user.wishList.includes(productId)) {
        return res.status(400).json({
          success: false,
          message: "Product already in wishList",
        });
      }

      // Thêm sản phẩm vào wishList
      user.wishList.push(productId);
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Product added to wishList",
        wishList: user.wishList,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  //[PUT] /user/
  async update(req, res, next) {
    try {
      const { _id } = req.user;
      if (!_id || Object.keys(req.body).length === 0)
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });

      // Cập nhật user
      // const updatedUser = await User.findByIdAndUpdate(_id, req.body, {
      //   new: true,
      // }).select("-password -role -refreshToken");
      const updatedUser = await User.findByIdAndUpdate(_id, req.body, {
        new: true,
      })
        .select("-password -role -refreshToken")
        .populate({
          path: "wishList",
          populate: {
            path: "author publisher categories", // Nếu bạn muốn lấy cả thông tin của author, publisher, categories
          },
        });

      res.status(200).json({
        success: true,
        message: "User update successful",
        updatedUser,
      });
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
      const { uid } = req.params;
      if (Object.keys(req.body).length === 0)
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      // Cập nhật user
      const updatedUser = await User.findByIdAndUpdate(uid, req.body, {
        new: true,
      }).select("-password -role -refreshToken");

      res.status(200).json({
        success: true,
        message: "User update successful",
        updatedUser,
      });
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
      const { id } = req.params;
      const user = await User.findById(id);
      const check = await checkDocumentById(User, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }
      // Kiểm tra xem User có isBlocked là true không
      if (!user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: "User is not blocked and cannot be deleted",
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
  // [DELETE] /user/wishlist/:productId
  async removeFromWishlist(req, res) {
    try {
      const { _id } = req.user; // Lấy ID của user từ token
      const productId = req.params.productId; // Lấy productId từ URL

      // Lấy thông tin user
      const user = await User.findById(_id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Khởi tạo wishlist nếu chưa tồn tại
      if (!Array.isArray(user.wishList)) {
        user.wishList = [];
      }

      // Kiểm tra xem sản phẩm có trong wishlist không
      const index = user.wishList.indexOf(productId);
      if (index === -1) {
        return res.status(400).json({
          success: false,
          message: "Product not found in wishList",
        });
      }

      // Xóa sản phẩm khỏi wishlist
      user.wishList.splice(index, 1);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
        wishList: user.wishList, // Trả về wishlist sau khi xóa
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  // [DELETE] /user/wishlist/removeAll
  async removeAllFromWishlist(req, res) {
    try {
      const { _id } = req.user; // Lấy ID của user từ token

      // Lấy thông tin user
      const user = await User.findById(_id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Khởi tạo wishList nếu chưa tồn tại
      if (!Array.isArray(user.wishList)) {
        user.wishList = [];
      }

      // Xóa tất cả sản phẩm khỏi wishlist
      user.wishList = []; // Đặt wishlist thành mảng rỗng

      await user.save();

      return res.status(200).json({
        success: true,
        message: "All products removed from wishlist",
        wishList: user.wishList, // Trả về wishlist (sẽ là mảng rỗng)
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  //[DELETE] /user/:id/force
  async forceDelete(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: "User is not blocked and cannot be deleted",
        });
      }
      // Kiểm tra xem user đã bị xóa mềm chưa
      if (!user.isDeleted) {
        return res.status(400).json({
          success: false,
          message: "User must be soft deleted before hard delete",
        });
      }
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
      if (!restoredUser) {
        return res.status(400).json({
          success: false,
          message: "User not found",
        });
      }
      console.log("Restored User:", restoredUser);
      res.status(200).json({
        status: true,
        message: "Restored User",
        restoredUser,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error });
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

        // Lưu accessToken lên authorization
        userData.role = response.role;
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
      res.status(200).json({
        success: user ? true : false,
        userData: user ? user : "User not found",
      });
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
                        <strong style="color: #da4f25;"><a href=${process.env.URL_SERVER}/user/resetPassword/${resetToken}>Click here</a></strong>
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
          .json({ success: false, message: "Missing inputs" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Kiểm tra mật khẩu cũ
      const isCorrectOldPassword = await user.isCorrectPassword(oldPassword);
      if (!isCorrectOldPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Incorrect old password" });
      }
      // Kiểm tra mật khẩu mới có trùng với mật khẩu cũ không
      const isSameAsOldPassword = await user.isCorrectPassword(newPassword);
      if (isSameAsOldPassword) {
        return res
          .status(400)
          .json({
            success: false,
            message: "New password cannot be the same as old password",
          });
      }
      // Cập nhật mật khẩu mới
      user.password = newPassword;
      user.passwordChangedAt = Date.now();
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
