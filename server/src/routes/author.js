const express = require("express");
const authorController = require("../app/controllers/AuthorController");
const router = express.Router();
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");

router.get("/:id", authorController.getById);
router.get("/", authorController.getAll);
router.post("/store", [verifyAccessToken, isAdmin], authorController.store);
router.put("/:id", [verifyAccessToken, isAdmin], authorController.update);
router.delete(
  "/:id/force",
  [verifyAccessToken, isAdmin],
  authorController.forceDelete
);
router.delete("/:id", [verifyAccessToken, isAdmin], authorController.delete);
router.patch(
  "/:id/restore",
  [verifyAccessToken, isAdmin],
  authorController.restore
);

module.exports = router;
