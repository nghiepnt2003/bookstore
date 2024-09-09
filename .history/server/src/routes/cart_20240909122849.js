const express = require("express");
const cartController = require("../app/controllers/CartController");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");
const router = express.Router();

router.get("/summary", [verifyAccessToken], cartController.getCartSummary);
router.get("/", [verifyAccessToken], cartController.getCart);

router.post("/items", [verifyAccessToken], cartController.addProductToCart);
router.post("/checkout", [verifyAccessToken], cartController.checkoutCart);

router.put("/items", [verifyAccessToken], cartController.updateCartItem);
router.put(
  "/item/:id/checkout",
  [verifyAccessToken],
  cartController.updateSelectedForCheckout
);

router.delete(
  "/items/:item",
  [verifyAccessToken],
  cartController.deleteCartItem
);
router.delete("/", [verifyAccessToken], cartController.clearCart);

module.exports = router;
