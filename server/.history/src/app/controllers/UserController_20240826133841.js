const User = require("../models/User");
const { multipleMongooseToObject } = require("../../util/mongoose");
const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const { checkDocumentById } = require("../middlewares/checkDocumentMiddleware");

class UserController {
  //[GET] /user/:id
  async getById(req, res) {
    try {
      let user = await User.findOne({ _id: req.params.id });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  }
  //[GET] /user/
  async getAll(req, res) {
    try {
      let userList = await User.find({});
      res.status(200).json(userList);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  // [POST] /user/register
  async register(req, res) {
    try {
      const { username, password, fullname, email, phone } = req.body;

      // thiếu role với cart
      if (!username || !password || !fullname || !email || !phone) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }

      const user = new User(req.body);
      const savedUser = await user.save();

      const newCart = new Cart({ user: savedUser._id, items: [] });
      const savedCart = await newCart.save();
      savedUser.cart = savedCart._id;
      await savedUser.save();
      // Trả về tài liệu đã lưu thành công
      res.status(200).json({
        success: true,
        message: "Create User successful",
        data: savedUser,
      });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ success: false, message: "An error occurred " + err });
    }
  }

  //[PUT] /user/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;

      // Kiểm tra sự tồn tại của tài liệu
      const check = await checkDocumentById(User, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }

      // Cập nhật user
      const updatedUser = await User.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.status(200).json({
        success: true,
        message: "User update successful",
        data: updatedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred : " + error,
      });
    }
  }

  //[DELETE] /user/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const check = await checkDocumentById(User, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }
      // Xóa Cart liên quan đến User trước khi xóa User
      await Cart.delete({ user: id });

      await User.delete({ _id: req.params.id });
      res.status(200).json({
        success: true,
        message: "Delete successful",
      });
      // res.redirect("back");
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred",
      });
    }
  }
  //[DELETE] /user/:id/force
  async forceDelete(req, res, next) {
    try {
      await User.deleteOne({ _id: req.params.id });
      res.status(200).json({
        success: true,
        message: "Delete Force successful",
      });
      // res.redirect("back");
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred",
      });
    }
  }
  // [PATCH] /user/:id/restore
  async restore(req, res, next) {
    try {
      await User.restore({ _id: req.params.id });
      const restoredUser = await User.findById(req.params.id);
      console.log("Restored User:", restoredUser);
      res.status(200).json({
        status: "Successful",
        message: "Restored User",
        restoredUser,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new UserController();