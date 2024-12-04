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
}

module.exports = new UserService();
