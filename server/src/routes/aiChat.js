const express = require("express");
const router = express.Router();
const AIChatController = require("../app/controllers/AIChatController");
const { verifyAccessToken } = require("../app/middlewares/jwt");

// Route cho chat với AI
router.post("/chat", verifyAccessToken, AIChatController.handleChat);

// Route cho việc lưu lịch sử chat (có thể thêm sau)
// router.post('/history', verifyAccessToken, AIChatController.saveChatHistory);

module.exports = router;
