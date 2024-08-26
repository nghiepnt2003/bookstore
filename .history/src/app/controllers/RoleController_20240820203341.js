const Role = require("../models/Role");
const asyncHandler = require("express-async-handler");
class RoleController {
  // [GET] /role/create
  async create(req, res, rest) {
    res.json("123123");
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
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Missing inputs" });
    }

    try {
      // Kiểm tra xem có tài liệu nào đã tồn tại với tên tương tự không
      const existingRole = await Role.findOne({ name });

      if (existingRole) {
        // Nếu tên đã tồn tại, trả về thông báo lỗi
        return res.status(400).json({
          success: false,
          message: "Role with this name already exists",
        });
      }

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
      res.status(500).json({ success: false, message: "An error occurred" });
    }
  }
}
module.exports = new RoleController();
