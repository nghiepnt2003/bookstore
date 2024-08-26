const express = require("express");
const authorController = require("../app/controllers/AuthorController");
const router = express.Router();

router.post("/store", categoryController.store);

module.exports = router;
