const Category = require("../models/Category");
class CategoryController {
  // [POST] /category/store
  async store(req, res) {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Missing inputs" });
    }

    try {
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

  //[PUT] /course/:id
  async update(req, res, next) {
    try {
      let formData = req.body;
      await Course.updateOne({ _id: req.params.id }, formData);
      res.redirect("/me/stored/courses");
    } catch (error) {
      console.log(next);
    }
  }
}

module.exports = new CategoryController();