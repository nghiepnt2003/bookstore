const express = require("express");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");
const discountController = require("../app/controllers/DiscountController");
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
router.get("/:id", [verifyAccessToken], orderController.getById);

router.post("/checkout", [verifyAccessToken], orderController.checkout);
router.delete("/:id", verifyAccessToken, orderController.deleteByUser);

module.exports = router;
