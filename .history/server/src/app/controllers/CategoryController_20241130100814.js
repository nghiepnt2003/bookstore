const {
  checkDocumentExistence,
  checkDocumentById,
} = require("../middlewares/checkDocumentMiddleware");
const Category = require("../models/Category");
const categoryService = require("../services/categoryService");
class CategoryController {
  //[GET] /category/:id
  async getById(req, res) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      res.status(200).json({ success: category ? true : false, category });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  //[GET] /category/
  async getAll(req, res) {
    try {
      let categories = await Category.find({});
      res.status(200).json({ success: categories ? true : false, categories });
    } catch (error) {
      res.status(500).json(error);
    }
  }
  // [POST] /category/store
  async store(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }
      // Kiểm tra sự tồn tại của tài liệu Category
      // const check = await checkDocumentExistName(Category, name);
      // if (!check.exists) {
      //   return res.status(400).json({
      //     success: false,
      //     message: check.message,
      //   });
      // }
      // Nếu tên chưa tồn tại, tạo tài liệu mới
      const category = new Category({ name });
      const savedCategory = await category.save();

      // Trả về tài liệu đã lưu thành công
      res.status(200).json({
        success: true,
        message: "Create successful",
        data: savedCategory,
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred" + err });
    }
  }

  // [PUT] /category/:id
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
        message: "An error occurred " + error,
      });
    }
  }

  //[DELETE] /category/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const check = await checkDocumentById(Category, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }
      await Category.delete({ _id: req.params.id });
      res.status(200).json({
        success: true,
        message: "Delete successful",
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
  //[DELETE] /category/:id/force
  async forceDelete(req, res, next) {
    try {
      await Category.deleteOne({ _id: req.params.id });
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
  // [PATCH] /category/:id/restore
  async restore(req, res, next) {
    try {
      await Category.restore({ _id: req.params.id });
      const restoredCategory = await Category.findById(req.params.id);
      if (!restoredCategory) {
        return res.status(400).json({
          success: false,
          message: "Category not found",
        });
      }
      res.status(200).json({
        status: true,
        message: "Restored category",
        restoredCategory,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred " + error,
      });
    }
  }
}

module.exports = new CategoryController();
