class RoleController {
  // [GET] /role/create
  async create(req, res, rest) {
    res.render("role/create");
  }
}
module.exports = new RoleController();
