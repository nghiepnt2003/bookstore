const {
  checkDocumentExistence,
  checkDocumentById,
} = require("../middlewares/checkDocumentMiddleware");
const Role = require("../models/Role");
class RoleController {
  //[GET] /role/:id
  async getById(req, res) {
    try {
      let role = await Role.findOne({ _id: req.params.id });
      res.status(200).json({ success: role ? true : false, role });
    } catch (error) {
      res.status(500).json({ success: false, message: error });
    }
  }
  //[GET] /role/
  async getAll(req, res) {
    try {
      let roles = await Role.find({});
      res.status(200).json({ success: roles ? true : false, roles });
    } catch (error) {
      res.status(500).json({ success: false, message: error });
    }
  }

  // [POST] /role/store
  // store(req, res, rest) {
  //   const { name } = req.body;
  //   if (!name) {
  //     res.status(400).json({ success: false, message: "Missing inputs" });
  //   }
  //   const role = new Role({ name });
  //   role
  //     .save()
  //     .then((data) => res.json({ Message: "Create successfull", ...data._doc }))
  //     .catch((err) => {
  //       console.log(err);
  //       res.status(400).json(err);
  //     });
  // }
  async store(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }
      // Kiểm tra sự tồn tại của tài liệu Role
      // const check = await checkDocumentExistName(Role, name);
      // if (!check.exists) {
      //   return res.status(400).json({
      //     success: false,
      //     message: check.message,
      //   });
      // }

      // Nếu tên chưa tồn tại, tạo tài liệu mới
      const role = new Role({ name });
      const savedRole = await role.save();

      // Trả về tài liệu đã lưu thành công
      res.status(201).json({
        success: true,
        message: "Create successful",
        data: savedRole,
      });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ success: false, message: "An error occurred : " + err });
    }
  }

  //[PUT] /role/:id
  // async update(req, res, next) {
  //   try {
  //     let formData = req.body;
  //     const { name } = formData;

  //     // Kiểm tra xem tên role đã tồn tại chưa
  //     const existingRole = await Role.findOne({ name });

  //     if (existingRole) {
  //       // Nếu tên đã tồn tại, trả về thông báo lỗi
  //       return res.status(400).json({
  //         success: false,
  //         message: "Role with this name already exists",
  //       });
  //     }

  //     // Cập nhật và trả về role đã được cập nhật
  //     const updatedRole = await Role.findByIdAndUpdate(
  //       req.params.id,
  //       formData,
  //       { new: true } // Trả về tài liệu sau khi đã cập nhật
  //     );

  //     res.status(200).json({
  //       success: true,
  //       message: "Role update successful",
  //       data: updatedRole, // Trả về role đã được cập nhật
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

      // Kiểm tra sự tồn tại của tài liệu Role
      const check = await checkDocumentExistence(Role, id, name);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }
      // Cập nhật Role
      const updatedRole = await Role.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.status(200).json({
        success: true,
        message: "Role update successful",
        data: updatedRole,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred " + error,
      });
    }
  }

  //[DELETE] /role/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const check = await checkDocumentById(Role, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }
      await Role.delete({ _id: req.params.id });
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
  //[DELETE] /role/:id/force
  async forceDelete(req, res, next) {
    try {
      await Role.deleteOne({ _id: req.params.id });
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
  // [PATCH] /role/:id/restore
  async restore(req, res, next) {
    try {
      await Role.restore({ _id: req.params.id });
      const restoredRole = await Role.findById(req.params.id);
      if (!restoredPublisher) {
        return res.status(400).json({
          success: false,
          message: "Role not found",
        });
      }
      console.log("Restored Role:", restoredRole);
      res.status(200).json({
        status: true,
        message: "Restored Role",
        restoredRole,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred " + error,
      });
    }
  }
}

module.exports = new RoleController();
