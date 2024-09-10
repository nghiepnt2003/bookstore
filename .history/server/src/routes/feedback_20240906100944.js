const express = require("express");
const feedbackController = require("../app/controllers/FeedbackController");
const { verifyAccessToken } = require("../app/middlewares/jwt");
const router = express.Router();

// router.get("/:id", feedbackController.getById);
// router.get("/", feedbackController.getAll);
router.post("/store", [verifyAccessToken], feedbackController.store);

module.exports = router;
