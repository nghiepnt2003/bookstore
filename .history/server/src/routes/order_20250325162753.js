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
  "/byTime",
  [verifyAccessToken, isAdmin],
  orderController.getOrdersByTimes
);
router.get(
  "/checkOrderStatus/:orderId",
  [verifyAccessToken],
  orderController.checkOrderStatus
);
router.get(
  "/check-status-zalopay",
  [verifyAccessToken],
  orderController.checkPaymentStatusZaloPay
);
router.get(
  "/check-status-momo",
  [verifyAccessToken],
  orderController.checkPaymentStatusMomo
);
router.get(
  "/payment-url/:id",
  [verifyAccessToken],
  orderController.getMoMoPaymentUrl
);

router.get("/:id", [verifyAccessToken], orderController.getById);

router.post("/checkout", [verifyAccessToken], orderController.checkout);
router.post("/callbackZaloPay/:orderId", orderController.callbackZaloPay);
router.post("/callbackMomo/:orderId", orderController.callbackMomo);

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
router.put(
  "/confirmOrder/:id",
  [verifyAccessToken],
  orderController.confirmOrder
);

router.put("/:id", verifyAccessToken, orderController.deleteByUser);

module.exports = router;
