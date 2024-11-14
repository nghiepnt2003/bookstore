const express = require("express");
const blogController = require("../app/controllers/BlogController");
const { verifyAccessToken } = require("../app/middlewares/jwt");
const router = express.Router();

router.get("/:id", blogController.getById);
router.get("/", blogController.getAll);
router.post("/store", [verifyAccessToken], blogController.store);
router.put("/:id", [verifyAccessToken], blogController.update);
// router.delete("/:id/force", authorController.forceDelete);
// router.delete("/:id", authorController.delete);
// router.patch("/:id/restore", authorController.restore);

module.exports = router;
