const express = require("express");
const userController = require("../app/controllers/UserController");
const router = express.Router();

router.post("/register", userController.register);

module.exports = router;
