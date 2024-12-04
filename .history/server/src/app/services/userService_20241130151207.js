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
const { saveOTP } = require("../models/OTP");
const Product = require("../models/Product");
const { OAuth2Client } = require("google-auth-library");
const userService = require("../services/userService");
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
}

module.exports = new UserService();
