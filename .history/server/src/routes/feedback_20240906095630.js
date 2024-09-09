const express = require("express");
const feedbackController = require("../app/controllers/FeedbackController");
const router = express.Router();

router.get("/:id", categoryController.getById);
router.get("/", categoryController.getAll);
router.post("/store", categoryController.store);

module.exports = router;
