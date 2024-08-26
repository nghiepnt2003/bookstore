const express = require("express");
const RoleController = require("../app/controllers/RoleController");
const router = express.Router();
router.get("/stored/courses");
router.get("/trash/courses", roleController.store);

module.exports = router;
