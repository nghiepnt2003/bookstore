const User = require("../models/User");
const { multipleMongooseToObject } = require();
const asyncHandler = require("express-async-handler");
class UserController {
  // [GET] /
  async index(req, res, next) {
    try {
      let users = await User.find({});
      res.render("home", { users: multipleMongooseToObject(users) });
    } catch (err) {
      next(err);
    }
  }

  // [GET] /search
  search(req, res) {
    res.render("search");
  }
}

module.exports = new UserController();
