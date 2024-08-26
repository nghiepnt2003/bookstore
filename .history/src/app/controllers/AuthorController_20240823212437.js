const { checkDocumentById } = require("../middlewares/checkDocumentMiddleware");
const Author = require("../models/Author");
class AuthorController {
  //[GET] /author/:id
  async getById(req, res) {
    try {
      let author = await Author.findOne({ _id: req.params.id });
      res.status(200).json(author);
    } catch (error) {
      res.status(500).json(error);
    }
  }
  //[GET] /author/
  async getAll(req, res) {
    try {
      let authorList = await Author.find({});
      res.status(200).json(authorList);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  // [POST] /author/store
  async store(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }

      const author = new Author(req.body);
      const savedAuthor = await author.save();

      // Trả về tài liệu đã lưu thành công
      res.status(201).json({
        success: true,
        message: "Create successful",
        data: savedAuthor,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: "An error occurred" });
    }
  }

  async function validateFeedbacks(feedbacks) {
    const validFeedbacks = await Feedback.find({ _id: { $in: feedbacks } });
    return validFeedbacks.map(feedback => feedback._id);
  }
  //[PUT] /author/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;

      // Kiểm tra sự tồn tại của tài liệu
      const check = await checkDocumentById(Author, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }

      // Cập nhật author
      const updatedAuthor = await Author.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.status(200).json({
        success: true,
        message: "Author update successful",
        data: updatedAuthor,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred : " + error,
      });
    }
  }

  //[DELETE] /author/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const check = await checkDocumentById(Author, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }
      await Author.delete({ _id: req.params.id });
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
  //[DELETE] /author/:id/force
  async forceDelete(req, res, next) {
    try {
      await Author.deleteOne({ _id: req.params.id });
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
  // [PATCH] /author/:id/restore
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

module.exports = new AuthorController();
