const Feedback = require("../models/Feedback");
const Product = require("../models/Product");

class FeedbackController {
  //[GET] /getFeedbacks/
  async getFeedbacks(req, res) {
    // khi truyền  `product/price[gt]=5000&price[gte]=3000`
    // có nghĩa là truyền một object :  price: { gt:5000, gte:3000 }
    // Đây là cách truyền một object vào trong req.query
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
      if (queries?.name) {
        formatedQueries.name = { $regex: queries.name, $options: "i" };
      }

      // Execute query
      let queryCommand = Feedback.find(formatedQueries);

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
      const limit = +req.query.limit || process.env.LIMIT_FEEDBACKS;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      // Lấy danh sách sản phẩm
      const response = await queryCommand.exec();

      // Lấy số lượng sản phẩm
      const counts = await Feedback.find(formatedQueries).countDocuments();

      res.status(200).json({
        success: response.length > 0,
        counts,
        feedbacks: response.length > 0 ? response : "Cannot get feedbacks",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [POST] /feedback/rating
  async rating(req, res) {
    try {
      const { _id } = req.user;
      const { star, product, comment } = req.body;
      if (!star || !product)
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      const alreadyRating = await Feedback.findOne({ user: _id, product });
      let response;
      if (alreadyRating) {
        // update star and comment
        console.log("update star and comment ");
        response = await Feedback.findByIdAndUpdate(
          alreadyRating._id,
          { star, comment },
          { new: true }
        );
      } else {
        // create star and comment
        console.log("create star and comment ");
        const feedback = new Feedback({
          user: _id,
          star,
          product,
          comment,
        });
        response = await feedback.save();
      }
      //Cập nhật lại phần rating trong product
      const feedbacks = await Feedback.find({ product });
      const avgRating = (
        feedbacks.reduce((acc, item) => acc + item.star, 0) / feedbacks.length
      ).toFixed(1); // Giữ 1 chữ số thập phân

      // Cập nhật averageRating trong sản phẩm
      await Product.findByIdAndUpdate(product, {
        averageRating: parseFloat(avgRating),
      });

      // Trả về tài liệu đã lưu thành công
      res.status(200).json({
        success: response ? true : false,
        message: response ? "Rating successful" : "Have an issue ",
        data: response,
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred " + err });
    }
  }
  // [DELETE] /feedback/:id
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Lấy thông tin feedback để cập nhật lại rating của product
      const feedback = await Feedback.findById(id);
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: "Feedback not found",
        });
      }
      // Kiểm tra xem feedback này có thuộc về user hiện tại không
      if (feedback.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this feedback",
        });
      }
      // Xóa feedback
      const response = await Feedback.deleteOne({ _id: req.params.id });
      if (response.deletedCount === 0) {
        return res.status(500).json({
          success: false,
          message: "Failed to delete feedback",
        });
      }

      //Cập nhật lại phần rating trong product
      const feedbacks = await Feedback.find({ product: feedback.product });
      const avgRating =
        feedbacks.length > 0
          ? (
              feedbacks.reduce((acc, item) => acc + item.star, 0) /
              feedbacks.length
            ).toFixed(1)
          : 0; // Giữ 1 chữ số thập phân
      // Cập nhật averageRating trong sản phẩm
      await Product.findByIdAndUpdate(feedback.product, {
        averageRating: parseFloat(avgRating),
      });

      res.status(200).json({
        success: response ? true : false,
        message: response
          ? "Feedback deleted successfully"
          : "Failed to delete feedback",
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred " + err });
    }
  }
}

module.exports = new FeedbackController();
