const express = require("express");
const userController = require("../app/controllers/UserController");
const { verifyAccessToken } = require("../app/middlewares/jwt");
const router = express.Router();

router.get("/:id", userController.getById);
router.get("/", userController.getAll);
router.get("/", userController.getOne);

router.post("/register", userController.register);
router.post("/login", userController.login);
router.put("/:id", userController.update);
router.delete("/:id/force", userController.forceDelete);
router.delete("/:id", userController.delete);
router.patch("/:id/restore", userController.restore);

module.exports = router;
