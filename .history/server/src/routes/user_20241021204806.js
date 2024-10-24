const express = require("express");
const userController = require("../app/controllers/UserController");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");
const checkOTP = require("../app/middlewares/checkOTP");
const verifyGoogleToken = require("../app/middlewares/verifyGoogleToken");
const router = express.Router();

router.get("/logout", verifyAccessToken, userController.logout);
router.get("/forgotPassword", userController.forgotPassword);
router.get("/sendOTPCreateAccount", userController.sendOTPCreateAccount);
router.get("/wishlist", [verifyAccessToken], userController.getWishlist);

router.get("/:id", userController.getById);
router.get("/", [verifyAccessToken, isAdmin], userController.getAll);

router.post("/current", verifyAccessToken, userController.current);
router.post("/register", checkOTP, userController.register);
router.post("/login", userController.login);
router.post(
  "/loginWithGoogle",
  verifyGoogleToken,
  userController.loginWithGoogle.bind(userController)
);
router.post(
  "/:id/add-to-wishlist",
  [verifyAccessToken],
  userController.addToWishlist
);
router.put("/refreshAccessToken", userController.refreshAccessToken);
router.put("/resetPassword", userController.resetPassword);
router.put("/address/:uid", [verifyAccessToken], userController.addUserAddress);

router.put("/:uid", verifyAccessToken, isAdmin, userController.updateByAdmin);
router.put("/", verifyAccessToken, userController.update);

router.delete(
  "/wishlist/removeAll",
  [verifyAccessToken],
  userController.removeAllFromWishlist
);
router.delete(
  "/wishlist/:productId",
  [verifyAccessToken],
  userController.removeFromWishlist
);
router.delete(
  "/:id/force",
  [verifyAccessToken, isAdmin],
  userController.forceDelete
);
router.delete("/:id", [verifyAccessToken, isAdmin], userController.delete);

router.patch("/:id/restore", userController.restore);

module.exports = router;
