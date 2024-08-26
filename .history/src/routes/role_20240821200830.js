const express = require("express");
const roleController = require("../app/controllers/RoleController");
const router = express.Router();

router.post("/store", roleController.store);
router.put("/store", roleController.update);

module.exports = router;
