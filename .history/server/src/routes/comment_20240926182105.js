const express = require("express");
const commentController = require("../app/controllers/CommentController");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");

const {
  validateReferencesComment,
} = require("../app/middlewares/validateReferences");
const router = express.Router();
router.get("/", commentController.getAll);
router.post(
  "/create",
  [verifyAccessToken, validateReferencesComment],
  commentController.comment
);
router.put(
  "/:id",
  [verifyAccessToken, validateReferencesComment],
  commentController.editComment
);
router.delete("/:id/force", [verifyAccessToken], commentController.forceDelete);

module.exports = router;
