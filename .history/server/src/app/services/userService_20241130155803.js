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
  async updateUserProfile(req) {
    return new Promise((resolve, reject) => {
      Cloud.single("image")(req, res, async (err) => {
        if (err) {
          return reject({
            status: 500,
            response: {
              success: false,
              message: "Error uploading image",
              error: err.message,
            },
          });
        }

        const { _id } = req.user;
        const existingUser = await User.findById(_id);
        if (!existingUser) {
          return reject({
            status: 404,
            response: { success: false, message: "User not found" },
          });
        }

        // Xử lý xóa ảnh cũ nếu có ảnh mới được upload
        if (req.file) {
          if (existingUser.image) {
            const publicId = existingUser.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`bookstore/${publicId}`);
          }
          req.body.image = req.file.path; // Lưu URL của ảnh mới
        }

        if (!_id || Object.keys(req.body).length === 0) {
          return reject({
            status: 400,
            response: { success: false, message: "Missing inputs" },
          });
        }

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

        resolve({
          status: 200,
          response: {
            success: true,
            message: "User update successful",
            updatedUser,
          },
        });
      });
    });
  }

  // cập nhật user bởi admin
  async updateUserByAdmin(req) {
    return new Promise((resolve, reject) => {
      Cloud.single("image")(req, res, async (err) => {
        if (err) {
          return reject({
            status: 500,
            response: {
              success: false,
              message: "Error uploading image",
              error: err.message,
            },
          });
        }

        const { uid } = req.params;
        const existingUser = await User.findById(uid);
        if (!existingUser) {
          return reject({
            status: 404,
            response: { success: false, message: "User not found" },
          });
        }

        // Xử lý xóa ảnh cũ nếu có ảnh mới được upload
        if (req.file) {
          if (existingUser.image) {
            const publicId = existingUser.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`bookstore/${publicId}`);
          }
          req.body.image = req.file.path; // Lưu URL của ảnh mới
        }

        if (Object.keys(req.body).length === 0) {
          return reject({
            status: 400,
            response: { success: false, message: "Missing inputs" },
          });
        }

        // Cập nhật user
        const updatedUser = await User.findByIdAndUpdate(uid, req.body, {
          new: true,
        }).select("-password -role -refreshToken");

        resolve({
          status: 200,
          response: {
            success: true,
            message: "User update successful",
            updatedUser,
          },
        });
      });
    });
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
}

module.exports = new UserService();
