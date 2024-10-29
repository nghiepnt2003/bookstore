const express = require("express");
const messageController = require("../app/controllers/MessageController");
const { verifyAccessToken } = require("../app/middlewares/jwt");
const router = express.Router();

router.post("/send", verifyAccessToken, messageController.sendMessage);
router.put("/:id", verifyAccessToken, messageController.updateMessage);
router.put(
  "/seen/all/:receiver",
  verifyAccessToken,
  messageController.seenAllMessages
);

router.delete("/:id", verifyAccessToken, messageController.deleteMessage);

module.exports = router;
