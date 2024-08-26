const Role = require("../models/Role");

class RoleController {
  // [GET] /role/create
  async create(req, res, rest) {
    res.render("role/create");
  }
  // [POST] /role/store
  store(req, res, rest) {
    const role = new Role(req.body.name);
    role
      .save()
      .then(() => res.json(role))
      .catch((err) => {
        console.log(err);
      });
  }
}
module.exports = new RoleController();
