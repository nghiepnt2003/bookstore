const express = require("express");
const userController = require("../app/controllers/UserController");
const router = express.Router();

router.post("/store", userController.store);

module.exports = router;
