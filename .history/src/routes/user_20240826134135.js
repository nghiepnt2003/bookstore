const express = require("express");
const userController = require("../app/controllers/UserController");
const router = express.Router();

router.get("/:id", userController.getById);
router.get("/", userController.getAll);
router.post("/register", userController.register);
router.put("/:id", userController.update);
router.delete("/:id/force", userController.forceDelete);
router.delete("/:id", userController.delete);
router.patch("/:id/restore", userController.restore);

module.exports = router;
