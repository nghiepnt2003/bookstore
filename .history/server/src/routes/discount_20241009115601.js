const express = require("express");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");
const discountController = require("../app/controllers/DiscountController");
const router = express.Router();

// Tạo mới discount
router.post("/", discountController.createDiscount);

// Lấy tất cả discount
router.get("/", discountController.getAllDiscounts);

// Lấy chi tiết discount theo ID
router.get("/:id", discountController.getDiscountById);

// Cập nhật discount
router.put("/:id", discountController.updateDiscount);

// Xóa discount
router.delete("/:id", discountController.deleteDiscount);

module.exports = router;
