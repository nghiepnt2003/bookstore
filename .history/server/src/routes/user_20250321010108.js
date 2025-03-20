const express = require("express");
const userController = require("../app/controllers/UserController");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");
const checkOTP = require("../app/middlewares/checkOTP");
const verifyGoogleToken = require("../app/middlewares/verifyGoogleToken");
const validateUserInfo = require("../app/middlewares/validateUserInfo");
const router = express.Router();

router.get("/logout", verifyAccessToken, userController.logout);
router.get("/forgotPassword", userController.forgotPassword);

router.get("/wishlist", [verifyAccessToken], userController.getWishlist);
router.get("/bookmark", [verifyAccessToken], userController.getBookmarks);
// router.get("/addresses", verifyAccessToken, userController.getAddresses);
router.get("/:id", userController.getById);
router.get("/", [verifyAccessToken, isAdmin], userController.getAll);

router.post(
  "/sendOTPCreateAccount",
  validateUserInfo,
  userController.sendOTPCreateAccount
);
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
router.put(
  "/changePassword",
  [verifyAccessToken],
  userController.changePassword
);

router.put("/address", [verifyAccessToken], userController.addUserAddress);
router.put(
  "/address/:index",
  [verifyAccessToken],
  userController.updateUserAddress
);

router.put(
  "/block/:id",
  [verifyAccessToken, isAdmin],
  userController.blockUser
);
router.put("/:uid", verifyAccessToken, isAdmin, userController.updateByAdmin);
router.put("/", verifyAccessToken, userController.update);

router.delete(
  "/address/:index",
  [verifyAccessToken],
  userController.deleteUserAddress
);
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

router.patch(
  "/:id/restore",
  [verifyAccessToken, isAdmin],
  userController.restore
);

module.exports = router;
