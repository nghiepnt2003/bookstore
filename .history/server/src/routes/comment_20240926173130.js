const express = require("express");
const commentController = require("../app/controllers/CommentController");
const { verifyAccessToken } = require("../app/middlewares/jwt");

const {
  validateReferencesRating,
} = require("../app/middlewares/validateReferences");
const checkProductPurchased = require("../app/middlewares/checkProductPurchased");
const router = express.Router();

router.post(
  "/create",
  [verifyAccessToken, validateReferencesRating, checkProductPurchased],
  ratingController.rating
);
router.delete("/:id/force", [verifyAccessToken], ratingController.forceDelete);

module.exports = router;
