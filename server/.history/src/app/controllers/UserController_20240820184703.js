const User = require("../models/User");

class UserController {
  // [GET] /
  async index(req, res, next) {
    try {
      let courses = await Course.find({});
      // res.json(courses);

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
