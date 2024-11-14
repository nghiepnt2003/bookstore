const express = require("express");
const blogController = require("../app/controllers/BlogController");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");
const router = express.Router();

router.get("/:id", blogController.getById);
router.get("/", blogController.getAll);
router.post("/store", [verifyAccessToken], blogController.store);
router.put("/:id", [verifyAccessToken], blogController.update);
router.delete("/:id/force", [verifyAccessToken], blogController.forceDelete);
router.delete("/:id", [verifyAccessToken], blogController.delete);
router.patch(
  "/publish/:id",
  [verifyAccessToken, isAdmin],
  blogController.publish
);
router.patch("/publish/:id", , blogController.increaseView);
router.patch("/:id/restore", [verifyAccessToken], blogController.restore);

module.exports = router;
