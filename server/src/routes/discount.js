const express = require("express");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");
const discountController = require("../app/controllers/DiscountController");
const router = express.Router();

router.get("/:id", discountController.getDiscountById);
router.get("/", discountController.getAllDiscounts);
router.post(
  "/",
  [verifyAccessToken, isAdmin],
  discountController.createDiscount
);
//[PUT] /discount/apply-to-all/:discountId
router.put(
  "/apply-to-all/:discountId",
  [verifyAccessToken, isAdmin],
  discountController.applyDiscountToAllProducts
);
// [PUT] /discount/apply/:productId/:discountId
router.put(
  "/apply/:productId/:discountId",
  [verifyAccessToken, isAdmin],
  discountController.applyDiscountToProduct
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
