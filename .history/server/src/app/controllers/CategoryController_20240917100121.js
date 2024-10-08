const {
  checkDocumentExistence,
  checkDocumentById,
} = require("../middlewares/checkDocumentMiddleware");
const Category = require("../models/Category");
class CategoryController {
  //[GET] /category/:id
  async getById(req, res) {
    try {
      let category = await Category.findOne({ _id: req.params.id });
      res.status(200).json({ success: category ? true : false, category });
    } catch (error) {
      res.status(500).json({ success: false, message: error });
    }
  }
  //[GET] /category/
  async getAll(req, res) {
    try {
      let categories = await Category.find({});
      res
        .status(200)
        .json({ success: categoryList ? true : false, categories });
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
