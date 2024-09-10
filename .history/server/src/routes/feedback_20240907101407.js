const express = require("express");
const feedbackController = require("../app/controllers/FeedbackController");
const { verifyAccessToken } = require("../app/middlewares/jwt");
const {
  validateReferencesFeedback,
} = require("../app/middlewares/validateReferences");
const router = express.Router();

router.get("/", feedbackController.getFeedbacks);

router.post(
  "/create",
  [verifyAccessToken, validateReferencesFeedback],
  feedbackController.rating
);
router.delete("/:id", [verifyAccessToken], feedbackController.delete);

module.exports = router;
