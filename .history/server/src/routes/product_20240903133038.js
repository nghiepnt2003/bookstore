const express = require("express");
const router = express.Router();
const productController = require("../app/controllers/ProductController");
const validateReferences = require("../app/middlewares/validateReferences");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");

router.get("/:id", productController.getById);
router.get("/", productController.getAll);
router.post(
  "/store",
  verifyAccessToken,
  isAdmin,
  validateReferences,
  productController.store
);
router.put(
  "/:id",
  verifyAccessToken,
  isAdmin,
  validateReferences,
  productController.update
);
router.delete("/:id/force", productController.forceDelete);
router.delete("/:id", productController.delete);
router.patch("/:id/restore", productController.restore);

module.exports = router;
