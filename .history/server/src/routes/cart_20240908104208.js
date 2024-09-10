const express = require("express");
const cartController = require("../app/controllers/CartController");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");
const router = express.Router();

router.put(
  "/store",
  [verifyAccessToken, isAdmin],
  cartController.addProductToCart
);

module.exports = router;
