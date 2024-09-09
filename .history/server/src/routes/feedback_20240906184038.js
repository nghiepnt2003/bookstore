const express = require("express");
const feedbackController = require("../app/controllers/FeedbackController");
const { verifyAccessToken } = require("../app/middlewares/jwt");
const router = express.Router();

router.post(
  "/create",
  [verifyAccessToken, validateReferencesFeedback],
  feedbackController.rating
);

module.exports = router;
