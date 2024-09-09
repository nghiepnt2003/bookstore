const { checkDocumentById } = require("../middlewares/checkDocumentMiddleware");
const Publisher = require("../models/Publisher");

class PublisherController {
  //[GET] /publisher/:id
  async getById(req, res) {
    try {
      let publisher = await Publisher.findOne({ _id: req.params.id });
      res.status(200).json({ success: publisher ? true : false, publisher });
    } catch (error) {
      res.status(500).json({ success: false, message: error });
    }
  }
  //[GET] /publisher/
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
      if (queries?.name) {
        formatedQueries.name = { $regex: queries.name, $options: "i" };
      }

      // Execute query
      let queryCommand = Publisher.find(formatedQueries);

      // Sorting
      if (req.query.sort) {
        // abc,exg => [abc,exg] => "abc exg"
        const sortBy = req.query.sort.split(",").join(" ");
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
      const limit = +req.query.limit || process.env.LIMIT_PUBLISHERS;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      // Lấy danh sách sản phẩm
      const response = await queryCommand.exec();

      // Lấy số lượng sản phẩm
      const counts = await Publisher.find(formatedQueries).countDocuments();

      res.status(200).json({
        success: response.length > 0,
        counts,
        publishers: response.length > 0 ? response : "Cannot get publisher",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
    // try {
    //   let publisherList = await Publisher.find({});
    //   res
    //     .status(200)
    //     .json({ success: publisherList ? true : false, publisherList });
    // } catch (error) {
    //   res.status(500).json({ success: false, message: error });
    // }
  }
  // [POST] /publisher/store
  async store(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }

      const publisher = new Publisher(req.body);
      const savedPublisher = await publisher.save();

      // Trả về tài liệu đã lưu thành công
      res.status(201).json({
        success: true,
        message: "Create successful",
        data: savedPublisher,
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred" + err });
    }
  }

  //[PUT] /publisher/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;

      // Kiểm tra sự tồn tại của tài liệu
      const check = await checkDocumentById(Publisher, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }

      // Cập nhật
      const updatedPublisher = await Publisher.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.status(200).json({
        success: true,
        message: "Publisher update successful",
        data: updatedPublisher,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred : " + error,
      });
    }
  }

  //[DELETE] /publisher/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const check = await checkDocumentById(Publisher, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }
      await Publisher.delete({ _id: req.params.id });
      res.status(200).json({
        success: true,
        message: "Delete successful",
      });
      // res.redirect("back");
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred " + error,
      });
    }
  }
  //[DELETE] /publisher/:id/force
  async forceDelete(req, res, next) {
    try {
      await Publisher.deleteOne({ _id: req.params.id });
      res.status(200).json({
        success: true,
        message: "Delete Force successful",
      });
      // res.redirect("back");
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred " + error,
      });
    }
  }
  // [PATCH] /publisher/:id/restore
  async restore(req, res, next) {
    try {
      await Publisher.restore({ _id: req.params.id });
      const restoredPublisher = await Publisher.findById(req.params.id);
      console.log("Restored Publisher:", restoredPublisher);
      res.status(200).json({
        status: "Successful",
        message: "Restored publisher",
        restoredPublisher,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred " + error,
      });
    }
  }
}

module.exports = new PublisherController();
