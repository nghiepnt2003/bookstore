class RoleController {
  // [GET] /course/create
  async create(req, res, rest) {
    res.render("course/create");
  }
}
module.exports = new RoleController();
