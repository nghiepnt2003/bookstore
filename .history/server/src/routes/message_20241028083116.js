const express = require("express");
const messageController = require("../app/controllers/MessageController");
const { verifyAccessToken } = require("../app/middlewares/jwt");
const router = express.Router();

router.post("/send", verifyAccessToken, messageController.sendMessage);
router.put("/:id", verifyAccessToken, messageController.updateMessage);

module.exports = router;
