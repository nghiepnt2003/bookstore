const express = require("express");
const ratingController = require("../app/controllers/RatingController");
const { verifyAccessToken } = require("../app/middlewares/jwt");
const {
  validateReferencesRating,
} = require("../app/middlewares/validateReferences");
const router = express.Router();

router.post("/", ratingController.getAll);

router.post(
  "/create",
  [verifyAccessToken, validateReferencesRating],
  ratingController.rating
);
router.delete("/:id", [verifyAccessToken], feedbackController.delete);

module.exports = router;
