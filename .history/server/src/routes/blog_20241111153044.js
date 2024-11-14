const express = require("express");
const blogController = require("../app/controllers/BlogController");
const { verifyAccessToken, isBlogAuthor } = require("../app/middlewares/jwt");
const router = express.Router();

router.get("/:id", blogController.getById);
router.get("/", blogController.getAll);
router.post("/store", [verifyAccessToken], blogController.store);
router.put("/:id", [verifyAccessToken], blogController.update);
router.delete(
  "/:id/force",
  [verifyAccessToken, isBlogAuthor],
  blogController.forceDelete
);
router.delete("/:id", [verifyAccessToken, isBlogAuthor], blogController.delete);
router.patch("/:id/restore", [verifyAccessToken], blogController.restore);

module.exports = router;
