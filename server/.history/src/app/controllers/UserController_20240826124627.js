const User = require("../models/User");
const { multipleMongooseToObject } = require("../../util/mongoose");
const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");

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
}

module.exports = new UserController();