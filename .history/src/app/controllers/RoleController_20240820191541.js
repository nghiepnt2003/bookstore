class RoleController {
  // [GET] /role/create
  async create(req, res, rest) {
    res.render("role/create");
  }
  // [POST] /role/store
  store(req, res, rest) {
    req.body.image = `https://img.youtube.com/vi/${req.body.videoId}/sddefault.jpg`;
    const course = new Course(req.body);
    course
      .save()
      .then(() => res.redirect("/me/stored/courses"))
      .catch((err) => {
        console.log(err);
      });
  }
}
module.exports = new RoleController();
