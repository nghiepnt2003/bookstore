const express = require("express");
const feedbackController = require("../app/controllers/FeedbackController");
const router = express.Router();

router.get("/:id", categoryController.getById);
router.get("/", categoryController.getAll);
router.post("/store", categoryController.store);
router.put("/:id", categoryController.update);
router.delete("/:id/force", categoryController.forceDelete);
router.delete("/:id", categoryController.delete);
router.patch("/:id/restore", categoryController.restore);

module.exports = router;
