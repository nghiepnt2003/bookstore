const express = require("express");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");
const discountController = require("../app/controllers/DiscountController");
const router = express.Router();
// Lấy tất cả discount
router.get("/", discountController.getAllDiscounts);
// Lấy chi tiết discount theo ID
router.get("/:id", discountController.getDiscountById);
// Tạo mới discount
router.post(
  "/",
  [verifyAccessToken, isAdmin],
  discountController.createDiscount
);

// Cập nhật discount
router.put(
  "/:id",
  [verifyAccessToken, isAdmin],
  discountController.updateDiscount
);

// Xóa discount
router.delete(
  "/:id",
  [verifyAccessToken, isAdmin],
  discountController.deleteDiscount
);

module.exports = router;
