const User = require("../models/User");
const { multipleMongooseToObject } = require("../../util/mongoose");
const asyncHandler = require("express-async-handler");
class UserController {
  // [POST] /
  async index(req, res, next) {
    try {
      let users = await User.find({});
      res.json(users);
      //   res.render("home", { users: multipleMongooseToObject(users) });
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
