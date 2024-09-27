const express = require("express");
const ratingController = require("../app/controllers/RatingController");
const { verifyAccessToken } = require("../app/middlewares/jwt");

const {
  validateReferencesRating,
} = require("../app/middlewares/validateReferences");
const checkProductPurchased = require("../app/middlewares/checkProductPurchased");
const router = express.Router();

// router.post("/", ratingController.getAll);

router.post(
  "/create",
  [verifyAccessToken, validateReferencesRating, checkProductPurchased],
  ratingController.rating
);
router.delete(
  "/:id/force",
  [verifyAccessToken],
  feedbackController.forceDelete
);

module.exports = router;
