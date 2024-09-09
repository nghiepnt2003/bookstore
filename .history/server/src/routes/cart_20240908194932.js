const express = require("express");
const cartController = require("../app/controllers/CartController");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");
const router = express.Router();

router.get("/", [verifyAccessToken], cartController.getByUser);

router.post(
  "/addProductToCart",
  [verifyAccessToken],
  cartController.addProductToCart
);
router.put("/", [verifyAccessToken], cartController.updateCartItem);
router.delete("/:item", [verifyAccessToken], cartController.deleteCartItem);

module.exports = router;
