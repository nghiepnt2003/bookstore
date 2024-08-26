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

      // Nếu tên chưa tồn tại, tạo tài liệu mới
      const author = new Author(req.body);
      const savedCategory = await category.save();

      // Trả về tài liệu đã lưu thành công
      res.status(201).json({
        success: true,
        message: "Create successful",
        data: savedCategory,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: "An error occurred" });
    }
  }
}
