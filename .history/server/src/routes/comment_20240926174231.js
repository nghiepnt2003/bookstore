const express = require("express");
const commentController = require("../app/controllers/CommentController");
const { verifyAccessToken } = require("../app/middlewares/jwt");

const {
  validateReferencesComment,
} = require("../app/middlewares/validateReferences");
const router = express.Router();
router.get(
  "/",

  commentController.comment
);
router.post(
  "/create",
  [verifyAccessToken, validateReferencesComment],
  commentController.comment
);

module.exports = router;