const express = require("express");
const categoryController = require("../app/controllers/CategoryController");
const router = express.Router();

router.post("/store", categoryController.store);
router.put("/:id", categoryController.update);

module.exports = router;
