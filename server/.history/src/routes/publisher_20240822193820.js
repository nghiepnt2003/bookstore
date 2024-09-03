const express = require("express");
const publisherController = require("../app/controllers/PublisherController");
const router = express.Router();

router.get("/:id", publisherController.getById);
router.get("/", publisherController.getAll);
router.post("/store", publisherController.store);
router.put("/:id", publisherController.update);

module.exports = router;