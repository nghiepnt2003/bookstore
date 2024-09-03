const express = require("express");
const userController = require("../app/controllers/UserController");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");
const router = express.Router();

router.get("/logout", verifyAccessToken, userController.logout);
router.get("/forgotPassword", userController.forgotPassword);

router.get("/:id", userController.getById);
router.get("/", [verifyAccessToken, isAdmin], userController.getAll);

router.post("/current", verifyAccessToken, userController.current);
router.post("/register", userController.register);
router.post("/login", userController.login);

router.put("/refreshAccessToken", userController.refreshAccessToken);
router.put("/resetPassword", userController.resetPassword);
router.put("/:uid", verifyAccessToken, isAdmin, userController.updateByAdmin);
router.put("/", verifyAccessToken, userController.update);

router.delete(
  "/:id/force",
  [verifyAccessToken, isAdmin],
  userController.forceDelete
);
router.delete("/:id", [verifyAccessToken, isAdmin], userController.delete);

router.patch("/:id/restore", userController.restore);

module.exports = router;
