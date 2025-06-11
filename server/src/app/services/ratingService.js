const Product = require("../models/Product");
const Rating = require("../models/Rating");

class RatingService {
  // Tìm tất cả đánh giá với các tham số truy vấn
  async getRatings(queries) {
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

    // Lọc theo product nếu có trong query
    if (queries?.product) {
      formatedQueries.product = queries.product;
    }

    // Truy vấn Rating
    let queryCommand = Rating.find(formatedQueries).populate({
      path: "user",
      select: "username fullname image", // Chỉ lấy các trường cần thiết từ user
    });

    // Sorting
    if (queries.sort) {
      const sortBy = queries.sort.split(",").join(" ");
      queryCommand = queryCommand.sort(sortBy);
    }

    // fields limiting
    if (queries.fields) {
      const fields = queries.fields.split(",").join(" ");
      queryCommand = queryCommand.select(fields);
    }

    // Pagination
    const page = +queries.page || 1;
    const limit = +queries.limit || process.env.LIMIT_RATINGS || 10;
    const skip = (page - 1) * limit;
    queryCommand.skip(skip).limit(limit);

    // Thực thi truy vấn
    const ratings = await queryCommand.exec();

    // Đếm số lượng đánh giá
    const counts = await Rating.find(formatedQueries).countDocuments();

    return { ratings, counts };
  }

  // Tạo hoặc cập nhật rating cho sản phẩm
  async rating(userId, star, productId) {
    let rating = await Rating.findOne({ user: userId, product: productId });

    if (rating) {
      // Nếu đã có rating, cập nhật số sao
      rating = await Rating.findByIdAndUpdate(
        rating._id,
        { star },
        { new: true }
      );
    } else {
      // Tạo mới rating
      rating = new Rating({
        user: userId,
        star,
        product: productId,
      });
      await rating.save();
    }

    // Tính lại rating trung bình
    const ratings = await Rating.find({ product: productId });
    const avgRating = (
      ratings.reduce((acc, item) => acc + item.star, 0) / ratings.length
    ).toFixed(1);

    // Cập nhật averageRating trong Product
    await Product.findByIdAndUpdate(productId, {
      averageRating: parseFloat(avgRating),
    });

    return rating;
  }

  // Xóa rating và cập nhật lại averageRating của sản phẩm
  async forceDelete(ratingId, userId) {
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      throw new Error("Rating not found");
    }

    if (rating.user.toString() !== userId.toString()) {
      throw new Error("You are not authorized to delete this rating");
    }

    // Xóa rating
    const response = await Rating.deleteOne({ _id: ratingId });
    if (response.deletedCount === 0) {
      throw new Error("Failed to delete rating");
    }

    // Cập nhật lại averageRating cho sản phẩm
    const ratings = await Rating.find({ product: rating.product });
    const avgRating =
      ratings.length > 0
        ? (
            ratings.reduce((acc, item) => acc + item.star, 0) / ratings.length
          ).toFixed(1)
        : 0; // Giữ 1 chữ số thập phân

    // Cập nhật averageRating trong sản phẩm
    await Product.findByIdAndUpdate(rating.product, {
      averageRating: parseFloat(avgRating),
    });

    return true;
  }
}

module.exports = new RatingService();
