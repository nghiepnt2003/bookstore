const { checkDocumentById } = require("../middlewares/checkDocumentMiddleware");
const Publisher = require("../models/Publisher");

class PublisherController {
  //[GET] /publisher/:id
  async getById(req, res) {
    try {
      let publisher = await Publisher.findOne({ _id: req.params.id });
      res.status(200).json(publisher);
    } catch (error) {
      res.status(500).json(error);
    }
  }
  //[GET] /publisher/
  async getAll(req, res) {
    try {
      let publisherList = await Publisher.find({});
      res.status(200).json(publisherList);
    } catch (error) {
      res.status(500).json(error);
    }
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
      console.log(err);
      res.status(500).json({ success: false, message: "An error occurred" });
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
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred",
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
        message: "An error occurred",
      });
    }
  }
  // [PATCH] /publisher/:id/restore
  async restore(req, res, next) {
    try {
      await Author.restore({ _id: req.params.id });
      const restoredAuthor = await Author.findById(req.params.id);
      console.log("Restored Author:", restoredAuthor);
      res.status(200).json({
        status: "Successful",
        message: "Restored author",
        restoredAuthor,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new PublisherController();
