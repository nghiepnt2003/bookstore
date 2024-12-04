const {
  checkDocumentExistence,
  checkDocumentById,
} = require("../middlewares/checkDocumentMiddleware");
const Role = require("../models/Role");
const asyncHandler = require("express-async-handler");
const roleService = require("../services/roleService");
class RoleController {
  //[GET] /role/:id
  async getById(req, res) {
    try {
      const role = await roleService.getRoleById(req.params.id);
      res.status(200).json({ success: role ? true : false, role });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  //[GET] /role/
  async getAll(req, res) {
    try {
      const roles = await roleService.getAllRoles();
      res.status(200).json({ success: roles ? true : false, roles });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [POST] /role/store
  async store(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }

      const savedRole = await roleService.createRole(name);
      res.status(201).json({
        success: true,
        message: "Create successful",
        data: savedRole,
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred: " + err.message });
    }
  }

  // [PUT] /role/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const updatedRole = await RoleService.updateRole(id, req.body);
      res.status(200).json({
        success: true,
        message: "Role update successful",
        data: updatedRole,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
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
