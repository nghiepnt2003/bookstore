const express = require("express");
const inventoryController = require("../app/controllers/InventoryController");
const { verifyAccessToken } = require("../app/middlewares/jwt");
const router = express.Router();

router.post("/create", verifyAccessToken, inventoryController.sendMessage);

module.exports = router;
