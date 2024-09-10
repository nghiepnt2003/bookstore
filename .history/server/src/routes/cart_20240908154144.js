const express = require("express");
const cartController = require("../app/controllers/CartController");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");
const router = express.Router();

router.post(
  "/addProductToCart",
  [verifyAccessToken],
  cartController.addProductToCart
);
router.put("/:id", [verifyAccessToken], cartController.);

module.exports = router;
