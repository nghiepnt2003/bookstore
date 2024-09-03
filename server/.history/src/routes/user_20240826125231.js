const express = require("express");
const userController = require("../app/controllers/UserController");
const router = express.Router();

router.get("/:id", userController.getById);
router.get("/", userController.getAll);
router.post("/register", userController.register);
router.put("/:id", userController.update);

module.exports = router;