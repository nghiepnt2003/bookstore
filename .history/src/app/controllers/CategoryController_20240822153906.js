const checkDocumentExistence = require("../middlewares/checkDocumentMiddleware");
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

  //[PUT] /category/:id
  // async update(req, res, next) {
  //   try {
  //     let formData = req.body;
  //     const { name } = formData;

  //     // Kiểm tra xem tên category đã tồn tại chưa
  //     const existingCategory = await Category.findOne({ name });

  //     if (existingCategory) {
  //       // Nếu tên đã tồn tại, trả về thông báo lỗi
  //       return res.status(400).json({
  //         success: false,
  //         message: "Category with this name already exists",
  //       });
  //     }

  //     // Cập nhật và trả về category đã được cập nhật
  //     const updatedCategory = await Category.findByIdAndUpdate(
  //       req.params.id,
  //       formData,
  //       { new: true } // Trả về tài liệu sau khi đã cập nhật
  //     );

  //     res.status(200).json({
  //       success: true,
  //       message: "Category update successful",
  //       data: updatedCategory, // Trả về category đã được cập nhật
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).json({
  //       success: false,
  //       message: "An error occurred",
  //     });
  //   }
  // }
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      // Kiểm tra sự tồn tại của tài liệu Category
      const check = await checkDocumentExistence(Category, id, name);
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

  //[DELETE] /category/:id
  async delete(req, res, next) {
    try {
      await Category.delete({ _id: req.params.id });
      res.json("        success: false,
        message: "An error occurred",");
    } catch (error) {
      console.log(next);
    }
  }
  //[DELETE] /course/:id/force
  async forceDelete(req, res, next) {
    try {
      await Course.deleteOne({ _id: req.params.id });
      res.redirect("back");
    } catch (error) {
      console.log(next);
    }
  }

}

module.exports = new CategoryController();
