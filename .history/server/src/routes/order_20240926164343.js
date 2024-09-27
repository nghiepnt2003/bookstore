const express = require("express");
const { verifyAccessToken } = require("../app/middlewares/jwt");
const orderController = require("../app/controllers/OrderController");
const router = express.Router();

router.get(
  "/getAllsByUser",
  [verifyAccessToken],
  orderController.getOrdersByUser
);
router.get("/:id", [verifyAccessToken], orderController.getById);

router.post("/checkout", [verifyAccessToken], orderController.checkout);
module.exports = router;
