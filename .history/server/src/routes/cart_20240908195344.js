const express = require("express");
const cartController = require("../app/controllers/CartController");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");
const router = express.Router();

router.get("/", [verifyAccessToken], cartController.getByUser);

router.post("/items", [verifyAccessToken], cartController.addProductToCart);
router.put("/items", [verifyAccessToken], cartController.updateCartItem);
router.delete(
  "/items/:item",
  [verifyAccessToken],
  cartController.deleteCartItem
);

module.exports = router;
