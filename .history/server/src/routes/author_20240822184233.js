const express = require("express");
const authorController = require("../app/controllers/AuthorController");
const router = express.Router();

router.get("/:id", authorController.getById);
router.get("/", authorController.getAll);
router.post("/store", authorController.store);
router.put("/:id", authorController.update);
router.delete("/:id/force", authorController.forceDelete);
router.delete("/:id", authorController.delete);
router.patch("/:id/restore", authorController.restore);

module.exports = router;
