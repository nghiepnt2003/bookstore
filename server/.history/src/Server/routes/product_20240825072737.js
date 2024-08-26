const express = require("express");
const router = express.Router();
const productController = require("../app/controllers/ProductController");
const validateReferences = require("../app/middlewares/validateReferences");

router.get("/:id", productController.getById);
router.get("/", productController.getAll);
router.post("/store", validateReferences, productController.store);
router.put("/:id", validateReferences, productController.update);
router.delete("/:id/force", productController.forceDelete);
router.delete("/:id", productController.delete);
router.patch("/:id/restore", productController.restore);

module.exports = router;
