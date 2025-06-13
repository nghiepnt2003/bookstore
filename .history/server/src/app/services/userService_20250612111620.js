const Cart = require("../models/Cart");
const Member = require("../models/Member");
const User = require("../models/User");
const { multipleMongooseToObject } = require("../../util/mongoose");
const asyncHandler = require("express-async-handler");
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
const { saveOTP } = require("../models/Otp");
const Product = require("../models/Product");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.YOUR_GOOGLE_CLIENT_ID); // Client ID từ Google API

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

  // Tìm kiếm người dùng với các điều kiện và phân trang
  async getAllUsers(queries) {
    try {
      // Tách các trường đặc biệt ra khỏi query
      const queryCopy = { ...queries };
      const excludeFields = ["limit", "sort", "page", "fields"];
      excludeFields.forEach((el) => delete queryCopy[el]);

      // Format lại các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(queryCopy);
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

      // Execute query with populate
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
      if (queries.sort) {
        const sortBy = queries.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Fields limiting
      if (queries.fields) {
        const fields = queries.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      // Pagination
      const page = +queries.page || 1;
      const limit = +queries.limit || process.env.LIMIT_USERS;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit).select("-refreshToken -password");

      // Lấy danh sách người dùng
      const users = await queryCommand.exec();

      // Lấy tổng số người dùng
      const counts = await User.find(formatedQueries).countDocuments();

      return { users, counts };
    } catch (error) {
      throw new Error("Error fetching users: " + error.message);
    }
  }
  // Tìm người dùng theo ID và lấy danh sách bookmark
  async getBookmarksByUserId(userId) {
    try {
      const user = await User.findById(userId).populate("bookmarks");
      if (!user) {
        throw new Error("User not found");
      }
      return user.bookmarks;
    } catch (error) {
      throw new Error("Error fetching bookmarks: " + error.message);
    }
  }

  // Tạo số điện thoại ngẫu nhiên và kiểm tra tính duy nhất
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
  // Đăng nhập với Google và tạo người dùng mới nếu chưa có
  async loginWithGoogle(userInfo) {
    const email = userInfo.email;
    let user = await User.findOne({ email });

    if (!user) {
      // Upload ảnh đại diện của Google lên Cloudinary
      let imageUrl = null;
      if (userInfo.picture) {
        const uploadedImage = await cloudinary.uploader.upload(
          userInfo.picture,
          {
            folder: "bookstore",
          }
        );
        imageUrl = uploadedImage.secure_url; // URL ảnh sau khi upload lên Cloudinary
      }

      // Tạo số điện thoại ngẫu nhiên cho user
      const randomPhone = await this.generateRandomPhoneNumber();

      // Tạo mới người dùng
      const newUser = new User({
        username: email.split("@")[0], // Dùng phần đầu của email làm username
        fullname: userInfo.name,
        email,
        image: imageUrl,
        phone: randomPhone,
        password: userInfo._id, // Google login không cần mật khẩu
        role: 2, // Gán vai trò mặc định (nếu có)
      });

      const savedUser = await newUser.save();

      // Tạo mới giỏ hàng cho người dùng
      const newCart = new Cart({ user: savedUser._id, items: [] });
      const savedCart = await newCart.save();
      savedUser.cart = savedCart._id;

      // Tạo mới member cho người dùng
      const newMember = new Member({ score: 0, rank: "Bronze" });
      const savedMember = await newMember.save();
      savedUser.member = savedMember._id; // Liên kết member với user

      // Lưu user mới vào database
      user = await savedUser.save();
    }

    return user;
  }

  // Đăng ký người dùng mới
  async register(userData) {
    const { username, password, fullname, email, phone, address, image } =
      userData;

    // Kiểm tra các trường bắt buộc
    if (!username || !password || !fullname || !email || !phone) {
      throw new Error("Missing inputs");
    }

    // Kiểm tra xem username đã tồn tại chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error("Username already exists.");
    }

    let imageUrl = null;
    // Nếu có ảnh đại diện, upload lên Cloudinary
    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image, {
        folder: "bookstore",
      });
      imageUrl = uploadedImage.secure_url;
    }

    // Tạo mới người dùng
    const user = new User({ ...userData, image: imageUrl || userData.image });
    const savedUser = await user.save();

    // Tạo giỏ hàng cho người dùng
    const newCart = new Cart({ user: savedUser._id, items: [] });
    const savedCart = await newCart.save();
    savedUser.cart = savedCart._id;

    // Tạo thành viên cho người dùng
    const newMember = new Member({ score: 0, rank: "Bronze" });
    const savedMember = await newMember.save();
    savedUser.member = savedMember._id;

    // Lưu người dùng và thông tin liên kết
    await savedUser.save();

    // Gửi email xác nhận
    const html = `<!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Xác nhận OTP</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 14px; color: #333333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; border: 5px solid #39c6b9; border-radius: 10px; }
            .content { padding: 20px; }
            h1 { color: #39c6b9; }
            p { line-height: 1.5; }
            a { color: #0099ff; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h1>Book Store</h1>
              <p>Xin chào!</p>
              <p>Chúng tôi rất vui mừng thông báo rằng tài khoản của bạn tại Bookstore đã được đăng ký thành công! 🎉</p>
              <p>Chúc bạn có những trải nghiệm tuyệt vời tại Bookstore</p>
              <p>Trân trọng,</p>
              <p>Book Store</p>
            </div>
          </div>
        </body>
      </html>`;

    const data = { email, html };
    await sendMail("Create account successfully", data);

    return savedUser;
  }

  // cập nhật user
  async updateUser(_id, body, file) {
    const existingUser = await User.findById(_id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    // Xử lý xóa ảnh cũ nếu có ảnh mới được upload
    let newImageUrl = null;

    // Nếu có ảnh mới được upload, lưu URL vào body
    if (file) {
      newImageUrl = file.path; // Lưu URL của ảnh mới
      body.image = newImageUrl; // Cập nhật URL ảnh mới vào body
    }
    if (!_id || Object.keys(body).length === 0) {
      throw new Error("Missing inputs");
    }
    let updatedUser = null;
    try {
      // Cập nhật thông tin người dùng
      updatedUser = await User.findByIdAndUpdate(_id, body, {
        new: true,
        runValidators: true,
      })
        .select("-password -role -refreshToken")
        .populate({
          path: "wishList",
          populate: {
            path: "author publisher categories", // Nếu bạn muốn lấy cả thông tin của author, publisher, categories
          },
        });
      // Nếu có ảnh cũ, xóa ảnh cũ trên Cloudinary sau khi cập nhật thành công
      if (existingUser.image && existingUser.image !== newImageUrl) {
        const publicId = existingUser.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`bookstore/${publicId}`);
      }
    } catch (error) {
      // Nếu có lỗi xảy ra trong quá trình cập nhật, xóa ảnh mới trên Cloudinary
      if (newImageUrl) {
        const publicId = newImageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`bookstore/${publicId}`);
      }
      throw new Error(error);
    }
    return updatedUser;
  }
  // cập nhật user bởi admin
  async updateUserByAdmin(_id, body, file) {
    const existingUser = await User.findById(_id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    let newImageUrl = null;

    // Nếu có ảnh mới được upload, lưu URL vào body
    if (file) {
      newImageUrl = file.path; // Lưu URL của ảnh mới
      body.image = newImageUrl; // Cập nhật URL ảnh mới vào body
    }
    // Kiểm tra nếu không có _id hoặc không có dữ liệu
    if (!_id || Object.keys(body).length === 0) {
      throw new Error("Missing inputs");
    }
    // Cập nhật thông tin người dùng
    let updatedUser = null;
    try {
      updatedUser = await User.findByIdAndUpdate(_id, body, {
        new: true,
        runValidators: true, // Kiểm tra validation trước khi cập nhật
      })
        .select("-password -role -refreshToken")
        .populate({
          path: "wishList",
          populate: {
            path: "author publisher categories",
          },
        });
      // Nếu có ảnh cũ, xóa ảnh cũ trên Cloudinary sau khi cập nhật thành công
      if (existingUser.image && existingUser.image !== newImageUrl) {
        const publicId = existingUser.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`bookstore/${publicId}`);
      }
    } catch (error) {
      // Nếu có lỗi xảy ra trong quá trình cập nhật, xóa ảnh mới trên Cloudinary

      if (newImageUrl) {
        const publicId = newImageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`bookstore/${publicId}`);
      }
      throw new Error(error);
    }

    return updatedUser;
  }

  async deleteUserById(req) {
    try {
      const { id } = req.params;

      // Kiểm tra xem User có tồn tại không
      const check = await checkDocumentById(User, id);
      if (!check.exists) {
        return {
          status: 400,
          response: {
            success: false,
            message: check.message,
          },
        };
      }

      const user = await User.findById(id);

      // Kiểm tra xem User có isBlocked là true không
      if (!user.isBlocked) {
        return {
          status: 403,
          response: {
            success: false,
            message: "User is not blocked and cannot be deleted",
          },
        };
      }

      // Xóa Cart liên quan đến User trước khi xóa User
      await Cart.delete({ user: id });

      // Xóa User
      await User.delete({ _id: id });

      return {
        status: 200,
        response: {
          success: true,
          message: "Delete successful",
        },
      };
    } catch (error) {
      console.error(error);
      throw new Error("An error occurred while deleting the user");
    }
  }

  async removeFromWishlist(req) {
    try {
      const { _id } = req.user; // Lấy ID của user từ token
      const productId = req.params.productId; // Lấy productId từ URL

      // Lấy thông tin user
      const user = await User.findById(_id);
      if (!user) {
        return {
          status: 404,
          response: {
            success: false,
            message: "User not found",
          },
        };
      }

      // Khởi tạo wishlist nếu chưa tồn tại
      if (!Array.isArray(user.wishList)) {
        user.wishList = [];
      }

      // Kiểm tra xem sản phẩm có trong wishlist không
      const index = user.wishList.indexOf(productId);
      if (index === -1) {
        return {
          status: 400,
          response: {
            success: false,
            message: "Product not found in wishList",
          },
        };
      }

      // Xóa sản phẩm khỏi wishlist
      user.wishList.splice(index, 1);
      await user.save();

      return {
        status: 200,
        response: {
          success: true,
          message: "Product removed from wishlist",
          wishList: user.wishList, // Trả về wishlist sau khi xóa
        },
      };
    } catch (error) {
      console.error(error);
      throw new Error(
        "An error occurred while removing the product from wishlist"
      );
    }
  }

  async forceDelete(req) {
    try {
      const { id } = req.params;

      // Xóa Cart liên quan đến user
      await Cart.deleteOne({ user: id });

      // Xóa User
      await User.deleteOne({ _id: id });

      return {
        status: 200,
        response: {
          success: true,
          message: "Delete Force successful",
        },
      };
    } catch (error) {
      console.error(error);
      throw new Error("An error occurred while performing force delete");
    }
  }

  async restoreUserAndCart(id) {
    try {
      // Khôi phục người dùng và giỏ hàng
      await User.restore({ _id: id });
      await Cart.restore({ _id: id });

      // Tìm lại người dùng sau khi khôi phục
      const restoredUser = await User.findById(id);
      if (!restoredUser) {
        throw new Error("User not found");
      }

      return restoredUser;
    } catch (error) {
      throw error; // Propagate error to be handled by controller
    }
  }

  // Xử lý block/unblock user
  async blockUser(id, isBlocked) {
    try {
      // Kiểm tra user có tồn tại không
      const user = await User.findById(id).select(
        "-password -refreshToken -role"
      );
      if (!user) {
        throw new Error("User not found");
      }

      // Kiểm tra nếu là admin thì không thể block/unblock
      if (user.role === 1) {
        throw new Error("Cannot block an admin user");
      }

      // Cập nhật trạng thái block của user
      user.isBlocked = isBlocked ? isBlocked : false;
      await user.save();

      return user;
    } catch (error) {
      throw new Error(error.message || "Error blocking user");
    }
  }

  // Login
  async login(username, password) {
    try {
      const user = await User.findOne({ username });

      if (!user) {
        throw new Error("Không tìm thấy người dùng");
      }

      // Kiểm tra người dùng có bị chặn không
      if (user.isBlocked) {
        throw new Error("Người dùng đã bị chặn. Truy cập bị từ chối.");
      }

      // Kiểm tra mật khẩu
      const isPasswordCorrect = await user.isCorrectPassword(password);
      if (!isPasswordCorrect) {
        throw new Error("Mật khẩu không chính xác");
      }

      // Tạo token
      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);

      // Cập nhật refreshToken vào database
      await User.findByIdAndUpdate(user._id, { refreshToken }, { new: true });

      return { accessToken, refreshToken, user };
    } catch (error) {
      throw error; // Propagate error to be handled by controller
    }
  }

  // Current
  async getCurrentUser(userId) {
    try {
      const user = await User.findById(userId).select(
        "-refreshToken -password -role"
      );
      return user; // Trả về user nếu tìm thấy
    } catch (error) {
      throw new Error("Error retrieving user");
    }
  }

  // Hàm làm mới access token từ refresh token
  async refreshAccessToken(refreshToken) {
    try {
      // Đọc public key từ file
      var cert = fs.readFileSync("../key/publickey.crt");

      // Xác minh refresh token
      const decoded = jwt.verify(refreshToken, cert, { algorithms: ["RS256"] });

      // Tìm user trong cơ sở dữ liệu dựa trên _id và refreshToken
      const user = await User.findOne({ _id: decoded._id, refreshToken });

      if (!user) {
        throw new Error("Refresh token not matched");
      }

      // Tạo mới access token
      const newAccessToken = generateAccessToken(user._id, user.role);

      return { success: true, newAccessToken }; // Trả về access token mới
    } catch (err) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  async logout(refreshToken) {
    try {
      // Xóa refreshToken trong cơ sở dữ liệu
      const user = await User.findOneAndUpdate(
        { refreshToken },
        { refreshToken: "" },
        { new: true }
      );

      if (!user) {
        throw new Error("Refresh token not matched in database");
      }

      return { success: true }; // Trả về kết quả thành công
    } catch (error) {
      throw new Error("Logout failed");
    }
  }

  // Xử lý quên mật khẩu
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found with this email");
      }

      // Tạo token thay đổi mật khẩu
      const resetToken = user.createPasswordChangeToken();
      await user.save();

      // Tạo email HTML
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
                    <strong style="color: #da4f25;">
                      <a href="${process.env.URL_CLIENT}/reset-password/${resetToken}">Click here</a>
                    </strong>
                    <p>Cảm ơn bạn đã tin tưởng sử dụng web của chúng tôi!</p>
                    <p>Trân trọng,</p>
                    <p>Book Store</p>
                </div>
            </div>
        </body>
        </html>`;

      // Gửi email với nội dung đã tạo
      const data = { email, html };
      await sendMail("ForgotPassword", data);

      return {
        success: true,
        message: "Password reset email sent successfully",
      };
    } catch (error) {
      throw new Error("Error processing password reset: " + error.message);
    }
  }

  // Xử lý gửi OTP tạo tài khoản
  async sendOTPCreateAccount(email) {
    try {
      // Kiểm tra nếu email đã tồn tại trong hệ thống
      let user = await User.findOne({ email });
      if (user) {
        throw new Error("User with this email already exists");
      }

      // Tạo mã OTP ngẫu nhiên
      let otp_code = Math.floor(100000 + Math.random() * 900000).toString();

      // Lưu OTP vào cơ sở dữ liệu
      await saveOTP(email, otp_code);

      // Tạo nội dung email
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

      // Gửi email chứa mã OTP
      const data = { email, html };
      const result = await sendMail("Create Account", data);
      if (!result) {
        throw new Error("Failed to send OTP email.");
      }

      return { success: true, message: "OTP sent successfully." };
    } catch (error) {
      throw new Error(error.message || "Error processing OTP creation");
    }
  }

  // Xử lý reset password
  // Khi người dùng quên pass
  async resetPassword(resetToken, newPassword) {
    try {
      // Mã hóa resetToken bằng sha256 để tìm kiếm trong DB
      const passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Tìm người dùng với token hợp lệ và token chưa hết hạn
      const user = await User.findOne({
        passwordResetToken,
        passwordResetExpires: { $gt: Date.now() }, // Kiểm tra token chưa hết hạn
      });

      if (!user) {
        throw new Error("Invalid or expired reset token");
      }

      // Cập nhật mật khẩu mới
      user.password = newPassword;
      user.passwordChangedAt = Date.now(); // Lưu thời gian thay đổi mật khẩu
      user.passwordResetExpires = undefined; // Xóa thời gian hết hạn của token
      user.passwordResetToken = undefined; // Xóa token reset password

      await user.save(); // Lưu lại thông tin người dùng với mật khẩu mới

      return user; // Trả về người dùng sau khi cập nhật
    } catch (error) {
      throw new Error(error.message || "Error resetting password");
    }
  }

  // Xử lý thay đổi mật khẩu
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Kiểm tra mật khẩu cũ
      const isCorrectOldPassword = await user.isCorrectPassword(oldPassword);
      if (!isCorrectOldPassword) {
        throw new Error("Incorrect old password");
      }

      // Kiểm tra mật khẩu mới có giống mật khẩu cũ không
      const isSameAsOldPassword = await user.isCorrectPassword(newPassword);
      if (isSameAsOldPassword) {
        throw new Error("New password cannot be the same as the old password");
      }

      // Cập nhật mật khẩu mới
      user.password = newPassword;
      user.passwordChangedAt = Date.now();
      await user.save();

      return user; // Trả về người dùng sau khi cập nhật
    } catch (error) {
      throw new Error(error.message || "Error changing password");
    }
  }
}

module.exports = new UserService();
