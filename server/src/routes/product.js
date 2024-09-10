const express = require("express");
const router = express.Router();
const productController = require("../app/controllers/ProductController");
const {
  validateReferencesProduct,
} = require("../app/middlewares/validateReferences");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");

router.get("/:id", productController.getById);
router.get("/", productController.getProducts);
router.post(
  "/store",
  [verifyAccessToken, isAdmin, validateReferencesProduct],
  productController.store
);
router.put(
  "/:id",
  [verifyAccessToken, isAdmin, validateReferencesProduct],
  productController.update
);
router.delete(
  "/:id/force",
  [verifyAccessToken, isAdmin],
  productController.forceDelete
);
router.delete("/:id", productController.delete);
router.patch(
  "/:id/restore",
  [verifyAccessToken, isAdmin],
  productController.restore
);

module.exports = router;
