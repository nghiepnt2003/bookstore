const User = require("../models/User");
const { multipleMongooseToObject } = require("../../util/mongoose");
const asyncHandler = require("express-async-handler");
class UserController {
  // [POST] /user/store
  async register(req, res) {
    try {
      const { username, password, fullname, email, phone, role, cart } =
        req.body;

      if (
        !username ||
        !password ||
        !fullname ||
        !email ||
        !phone ||
        !role ||
        !cart
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }
      if (categories && typeof categories === "string") {
        try {
          req.body.categories = JSON.parse(categories).map(Number);
        } catch (error) {
          req.body.categories = categories.split(",").map(Number);
        }
      }

      const product = new Product(req.body);
      const savedProduct = await product.save();

      // Trả về tài liệu đã lưu thành công
      res.status(201).json({
        success: true,
        message: "Create product successful",
        data: savedProduct,
      });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ success: false, message: "An error occurred " + err });
    }
  }

  // [GET] /search
  search(req, res) {
    res.render("search");
  }
}

module.exports = new UserController();
