const Category = require("../models/Category");
const {
  checkDocumentExistence,
  checkDocumentById,
} = require("../middlewares/checkDocumentMiddleware");

class CategoryService {
  async getCategoryById(id) {
    const category = await Category.findOne({ _id: id });
    return category;
  }

  async getAllCategories() {
    const categories = await Category.find({});
    return categories;
  }

  async createCategory(name) {
    if (!name) {
      throw new Error("Missing inputs");
    }

    const category = new Category({ name });
    return await category.save();
  }

  async updateCategory(id, data) {
    const { name } = data;
    const check = await checkDocumentExistence(Category, id, name);
    if (!check.exists) {
      throw new Error(check.message);
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, data, {
      new: true,
    });
    return updatedCategory;
  }

  async deleteCategory(id) {
    const check = await checkDocumentById(Category, id);
    if (!check.exists) {
      throw new Error(check.message);
    }

    await Category.delete({ _id: id });
  }

  async forceDeleteCategory(id) {
    await Category.deleteOne({ _id: id });
  }

  async restoreCategory(id) {
    await Category.restore({ _id: id });
    const restoredCategory = await Category.findById(id);
    if (!restoredCategory) {
      throw new Error("Category not found");
    }
    return restoredCategory;
  }
}

module.exports = new CategoryService();
