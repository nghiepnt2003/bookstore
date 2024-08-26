const Role = require("../models/Role");

class RoleController {
  // [GET] /role/create
  async create(req, res, rest) {
    res.json("123123");
  }
  // [POST] /role/store
  store(req, res, rest) {
    res.json(req.body);
    const formData = { ...req.body.name, _id: "123" };
    const role = new Role(formData);

    // const role = new Role(req.body.name);
    // role
    //   .save()
    //   .then(() => res.json("Create successful"))
    //   .catch((err) => {
    //     console.log(err);
    //   });
  }
}
module.exports = new RoleController();
