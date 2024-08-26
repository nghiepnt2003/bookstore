const Author = require("../models/Author");
class AuthorController {
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

  //[PUT] /author/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      // Kiểm tra sự tồn tại của tài liệu Category
      const check = await checkDocumentById(Author, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }

      // Cập nhật Category
      const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.status(200).json({
        success: true,
        message: "Category update successful",
        data: updatedCategory,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred",
      });
    }
  }
}

module.exports = new AuthorController();
