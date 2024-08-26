const express = require("express");
const authorController = require("../app/controllers/AuthorController");
const router = express.Router();

router.post("/store", authorController.store);

module.exports = router;
