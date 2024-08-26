const Author = require("../models/Author");
class AuthorController {
  // [POST] /post/store
  async store(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }
      // Kiểm tra xem có tài liệu nào đã tồn tại với tên tương tự không
      const existingCategory = await Category.findOne({ name });

      if (existingCategory) {
        // Nếu tên đã tồn tại, trả về thông báo lỗi
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }

      // Nếu tên chưa tồn tại, tạo tài liệu mới
      const category = new Category({ name });
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
