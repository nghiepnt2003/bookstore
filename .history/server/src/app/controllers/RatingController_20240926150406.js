const Order = require("../models/Order");
const Product = require("../models/Product");
const Rating = require("../models/Rating");

class RatingController {
  //[GET] /
  //   async getAll(req, res) {
  //     try {
  //       const queries = { ...req.query };
  //       // Tách các trường đặc biệt ra khỏi query
  //       const excludeFields = ["limit", "sort", "page", "fields"];
  //       excludeFields.forEach((el) => delete queries[el]);

  //       // Format lại các operators cho đúng cú pháp mongoose
  //       let queryString = JSON.stringify(queries);
  //       queryString = queryString.replace(
  //         /\b(gte|gt|lt|lte)\b/g,
  //         (matchedEl) => `$${matchedEl}`
  //       );
  //       const formatedQueries = JSON.parse(queryString);

  //       // Filtering
  //       if (queries?.comment) {
  //         formatedQueries.comment = { $regex: queries.comment, $options: "i" };
  //       }

  //       // Execute query
  //       let queryCommand = Feedback.find(formatedQueries);

  //       // Sorting
  //       if (req.query.sort) {
  //         // abc,exg => [abc,exg] => "abc exg"
  //         const sortBy = req.query.sort.split(",").join(" ");
  //         // sort lần lượt bởi publisher author category nếu truyền  sort("publisher author categories")
  //         queryCommand = queryCommand.sort(sortBy);
  //       }

  //       // fields limiting
  //       if (req.query.fields) {
  //         const fields = req.query.fields.split(",").join(" ");
  //         queryCommand = queryCommand.select(fields);
  //       }

  //       //Pagination
  //       // limit: số docs lấy về 1 lần gọi API
  //       // skip:
  //       // Dấu + nằm trước số để chuyển sang số
  //       // +'2' => 2
  //       // +'asdasd' => NaN
  //       const page = +req.query.page || 1;
  //       const limit = +req.query.limit || process.env.LIMIT_FEEDBACKS;
  //       const skip = (page - 1) * limit;
  //       queryCommand.skip(skip).limit(limit);

  //       // Lấy danh sách sản phẩm
  //       const response = await queryCommand.exec();

  //       // Lấy số lượng sản phẩm
  //       const counts = await Feedback.find(formatedQueries).countDocuments();

  //       res.status(200).json({
  //         success: response.length > 0,
  //         counts,
  //         feedbacks: response.length > 0 ? response : "Cannot get feedbacks",
  //       });
  //     } catch (error) {
  //       res.status(500).json({ success: false, message: error.message });
  //     }
  //   }

  // [POST] /rating/create
  async rating(req, res) {
    try {
      const { _id } = req.user; // Lấy ID người dùng từ token
      const { star, product } = req.body; // Lấy số sao và sản phẩm từ request body

      if (!star || !product)
        return res
          .status(400)
          .json({ success: false, message: "Missing star or product input" });

      // Kiểm tra xem người dùng đã mua sản phẩm hay chưa
      const orderExists = await Order.findOne({
        user: _id,
        details: { $elemMatch: { productId: product } }, // Kiểm tra nếu có sản phẩm trong đơn hàng
      });
      console.log(_id);
      if (!orderExists) {
        return res.status(403).json({
          success: false,
          message: "You can only rate products you have purchased",
        });
      }

      // Tìm rating của người dùng cho sản phẩm này
      let rating = await Rating.findOne({ user: _id, product });

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
          user: _id,
          star,
          product,
        });
        await rating.save();
      }

      // Tính lại rating trung bình
      const ratings = await Rating.find({ product });
      const avgRating = (
        ratings.reduce((acc, item) => acc + item.star, 0) / ratings.length
      ).toFixed(1);

      // Cập nhật averageRating trong Product
      await Product.findByIdAndUpdate(product, {
        averageRating: parseFloat(avgRating),
      });

      res.status(200).json({
        success: true,
        message: "Rating successful",
        data: rating,
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred: " + err });
    }
  }

  // [DELETE] /rating/:id
  //   async delete(req, res) {
  //     try {
  //       const { id } = req.params;

  //       // Lấy thông tin feedback để cập nhật lại rating của product
  //       const feedback = await Feedback.findById(id);
  //       if (!feedback) {
  //         return res.status(404).json({
  //           success: false,
  //           message: "Feedback not found",
  //         });
  //       }
  //       // Kiểm tra xem feedback này có thuộc về user hiện tại không
  //       if (feedback.user.toString() !== req.user._id.toString()) {
  //         return res.status(403).json({
  //           success: false,
  //           message: "You are not authorized to delete this feedback",
  //         });
  //       }
  //       // Xóa feedback
  //       const response = await Feedback.deleteOne({ _id: req.params.id });
  //       if (response.deletedCount === 0) {
  //         return res.status(500).json({
  //           success: false,
  //           message: "Failed to delete feedback",
  //         });
  //       }

  //       //Cập nhật lại phần rating trong product
  //       const feedbacks = await Feedback.find({ product: feedback.product });
  //       const avgRating =
  //         feedbacks.length > 0
  //           ? (
  //               feedbacks.reduce((acc, item) => acc + item.star, 0) /
  //               feedbacks.length
  //             ).toFixed(1)
  //           : 0; // Giữ 1 chữ số thập phân
  //       // Cập nhật averageRating trong sản phẩm
  //       await Product.findByIdAndUpdate(feedback.product, {
  //         averageRating: parseFloat(avgRating),
  //       });

  //       res.status(200).json({
  //         success: response ? true : false,
  //         message: response
  //           ? "Feedback deleted successfully"
  //           : "Failed to delete feedback",
  //       });
  //     } catch (err) {
  //       res
  //         .status(500)
  //         .json({ success: false, message: "An error occurred " + err });
  //     }
  //   }
}

module.exports = new RatingController();
