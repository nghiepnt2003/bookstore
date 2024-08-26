const express = require("express");
const authorController = require("../app/controllers/AuthorController");
const router = express.Router();

router.get("/:id", roleController.getById);
router.get("/", roleController.getAll);
router.post("/store", authorController.store);
router.put("/:id", authorController.update);

module.exports = router;
