const express = require("express");
const publisherController = require("../app/controllers/PublisherController");
const router = express.Router();

router.post("/store", publisherController.store);

module.exports = router;
