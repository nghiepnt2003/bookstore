const express = require("express");
const roleController = require("../app/controllers/RoleController");
const router = express.Router();

router.get("/:id", roleController.findById);
router.post("/store", roleController.store);
router.put("/:id", roleController.update);

module.exports = router;
