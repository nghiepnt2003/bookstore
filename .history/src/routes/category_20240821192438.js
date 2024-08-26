const express = require("express");
const categoryController = require("../app/controllers/CategoryController");
const router = express.Router();

router.post("/store", roleController.store);

module.exports = router;
