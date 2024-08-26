const express = require("express");
const userController = require("../app/controllers/UserController");
const router = express.Router();

router.get("/:id", roleController.getById);
router.get("/", roleController.getAll);
router.post("/store", roleController.store);
router.put("/:id", roleController.update);
router.delete("/:id/force", roleController.forceDelete);
router.delete("/:id", roleController.delete);
router.patch("/:id/restore", roleController.restore);

module.exports = router;
