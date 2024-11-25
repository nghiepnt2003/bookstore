const express = require("express");
const inventoryController = require("../app/controllers/InventoryController");
const { verifyAccessToken, isAdmin } = require("../app/middlewares/jwt");
const router = express.Router();

router.get(
  "/",
  [verifyAccessToken, isAdmin],
  inventoryController.getAllInventory
);
router.get(
  "/",
  [verifyAccessToken, isAdmin],
  inventoryController.getInventoryByTime
);

router.post(
  "/create",
  [verifyAccessToken, isAdmin],
  inventoryController.createInventory
);

module.exports = router;
