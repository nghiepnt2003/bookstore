const Role = require("../models/Role");

class RoleController {
  // [GET] /role/create
  async create(req, res, rest) {
    res.render("role/create");
  }
  // [POST] /role/store
  store(req, res, rest) {
    // req.body.name = `https://img.youtube.com/vi/${req.body.videoId}/sddefault.jpg`;
    const role = new Role(req.body.name);
    role
      .save()
      .then(() => res.redirect("/me/stored/courses"))
      .catch((err) => {
        console.log(err);
      });
  }
}
module.exports = new RoleController();
