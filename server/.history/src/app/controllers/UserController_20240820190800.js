const User = require("../models/User");
const asyncHandler = require("express-async-handler");
class UserController {
  // [GET] /
  async index(req, res, next) {
    try {
      let users = await User.find({});
      res.render("home", { courses: multipleMongooseToObject(courses) });
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
