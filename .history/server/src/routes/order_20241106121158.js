const express = require("express");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");
const orderController = require("../app/controllers/OrderController");
const router = express.Router();

router.get(
  "/getAllsByUser",
  [verifyAccessToken],
  orderController.getAllsByUser
);
router.get(
  "/getAll",
  [verifyAccessToken, isAdmin],
  orderController.getAllByAdmin
);
router.get(
  "/checkOrderStatus/:orderId",
  [verifyAccessToken],
  orderController.checkOrderStatus
);
router.get(
  "/check-status",
  [verifyAccessToken],
  orderController.checkPaymentStatusZaloPay
);
router.get("/:id", [verifyAccessToken], orderController.getById);

router.post("/checkout", [verifyAccessToken], orderController.checkout);
router.post("/callback/:orderId", orderController.callbackZaloPay);

router.put(
  "/confirmQRcode/:orderId",
  [verifyAccessToken],
  orderController.confirmQRCodeScan
);
router.put(
  "/updateStatus/:id",
  [verifyAccessToken, isAdmin],
  orderController.updateStatus
);

router.delete("/:id", verifyAccessToken, orderController.deleteByUser);

module.exports = router;
