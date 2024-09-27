const express = require("express");
const commentController = require("../app/controllers/CommentController");
const { verifyAccessToken } = require("../app/middlewares/jwt");

const {
  validateReferencesComment,
} = require("../app/middlewares/validateReferences");
const router = express.Router();

router.post(
  "/create",
  [verifyAccessToken, validateReferencesComment],
  commentController.comment
);
router.delete("/:id/force", [verifyAccessToken], ratingController.forceDelete);

module.exports = router;
