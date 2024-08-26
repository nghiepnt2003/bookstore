const express = require("express");
const publisherController = require("../app/controllers/PublisherController");
const router = express.Router();

router.get("/:id", publisherController.getById);
router.get("/", publisherController.getAll);
router.post("/store", publisherController.store);
router.put("/:id", publisherController.update);
router.delete("/:id/force", publisherController.forceDelete);
router.delete("/:id", publisherController.delete);
router.patch("/:id/restore", publisherController.restore);

module.exports = router;
