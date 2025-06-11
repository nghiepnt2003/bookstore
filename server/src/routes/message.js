const express = require("express");
const messageController = require("../app/controllers/MessageController");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");
const router = express.Router();

router.get(
  "/admin/send/recent/:userId",
  [verifyAccessToken, isAdmin],
  messageController.getAdminRecentMessage
);
router.get(
  "/recent/:userId",
  verifyAccessToken,
  messageController.getRecentMessages
);
router.get(
  "/admin/conversations",
  [verifyAccessToken, isAdmin],
  messageController.getAdminConversations
);
router.get("/inbox", verifyAccessToken, messageController.getInBox);

router.post("/send", verifyAccessToken, messageController.sendMessage);
router.put("/:id", verifyAccessToken, messageController.updateMessage);
router.put(
  "/seen/all/:receiver",
  verifyAccessToken,
  messageController.seenMessages
);

router.delete("/:id", verifyAccessToken, messageController.deleteMessage);
router.get(
  "/admin/conversations",
  verifyAccessToken,
  messageController.getAdminConversations
);

module.exports = router;
