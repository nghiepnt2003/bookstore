const Role = require("../models/Role");
const {
  checkDocumentExistence,
  checkDocumentById,
} = require("../middlewares/checkDocumentMiddleware");

class RoleService {
  // Lấy tất cả các role
  async getAllRoles() {
    return await Role.find({});
  }

  // Lấy role theo ID
  async getRoleById(id) {
    return await Role.findOne({ _id: id });
  }

  // Tạo mới role
  async createRole(name) {
    const role = new Role({ name });
    return await role.save();
  }

  // Cập nhật role
  async updateRole(id, data) {
    const check = await checkDocumentExistence(Role, id, data.name);
    if (!check.exists) {
      throw new Error(check.message);
    }
    return await Role.findByIdAndUpdate(id, data, { new: true });
  }

  // Xóa role
  async deleteRole(id) {
    const check = await checkDocumentById(Role, id);
    if (!check.exists) {
      throw new Error(check.message);
    }
    return await Role.delete({ _id: id });
  }

  // Xóa force role
  async forceDeleteRole(id) {
    return await Role.deleteOne({ _id: id });
  }

  // Khôi phục role
  async restoreRole(id) {
    const restoredRole = await Role.restore({ _id: id });
    if (!restoredRole) {
      throw new Error("Role not found");
    }
    return restoredRole;
  }
}

module.exports = new RoleService();
