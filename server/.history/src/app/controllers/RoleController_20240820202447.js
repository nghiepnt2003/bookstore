const Role = require("../models/Role");

class RoleController {
  // [GET] /role/create
  async create(req, res, rest) {
    res.json("123123");
  }
  // [POST] /role/store
  // store(req, res, rest) {
  //   const { name } = req.body;
  //   if (!name) {
  //     res.status(400).json({ success: false, message: "Missing inputs" });
  //   }
  //   const role = new Role({ name });
  //   role
  //     .save()
  //     .then((data) => res.json({ Message: "Create successfull", ...data._doc }))
  //     .catch((err) => {
  //       console.log(err);
  //       res.status(400).json(err);
  //     });
  // }
  async store(req, res) {
    try {
      const { name } = req.body;
      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }

      const role = new Role({ name });
      const data = await role.save();
      res.json({ Message: "Create successful", ...data._doc });
    } catch (err) {
      console.log(err);
      res.status(400).json(err);
    }
  }
}
module.exports = new RoleController();
