const express = require("express");
const messageController = require("../app/controllers/MessageController");
const router = express.Router();

router.post("/send", messageController.sendMessage);
module.exports = router;
