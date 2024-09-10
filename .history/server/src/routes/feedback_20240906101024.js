const express = require("express");
const feedbackController = require("../app/controllers/FeedbackController");
const { verifyAccessToken } = require("../app/middlewares/jwt");
const router = express.Router();

router.post("/rating", [verifyAccessToken], feedbackController.rating);

module.exports = router;
