const express = require("express");
const router = express.Router();
const productController = require("../app/controllers/ProductController");

router.get("/:id", productController.getById);
router.get("/", productController.getAll);
router.post("/store", productController.store);
router.put("/:id", productController.update);

module.exports = router;
