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
      const categories = await categoryService.getAllCategories();
      res.status(200).json({ success: categories ? true : false, categories });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  // [POST] /category/store
  async store(req, res) {
    try {
      const { name } = req.body;
      const savedCategory = await categoryService.createCategory(name);
      res.status(200).json({
        success: true,
        message: "Create successful",
        data: savedCategory,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + err.message,
      });
    }
  }

  // [PUT] /category/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const updatedCategory = await categoryService.updateCategory(
        id,
        req.body
      );
      res.status(200).json({
        success: true,
        message: "Category update successful",
        data: updatedCategory,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  //[DELETE] /category/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      await categoryService.deleteCategory(id);
      res.status(200).json({
        success: true,
        message: "Delete successful",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }
  //[DELETE] /category/:id/force
  async forceDelete(req, res) {
    try {
      const { id } = req.params;
      await categoryService.forceDeleteCategory(id);
      res.status(200).json({
        success: true,
        message: "Delete Force successful",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }
  // [PATCH] /category/:id/restore
  async restore(req, res) {
    try {
      const { id } = req.params;
      const restoredCategory = await categoryService.restoreCategory(id);
      res.status(200).json({
        success: true,
        message: "Restored category",
        restoredCategory,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }
}

module.exports = new CategoryController();
