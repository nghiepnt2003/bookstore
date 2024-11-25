const express = require("express");
const inventoryController = require("../app/controllers/InventoryController");
const router = express.Router();

router.post("/send", verifyAccessToken, inventoryController.sendMessage);

module.exports = router;
