const Inventory = require("../models/Inventory");
const InventoryDetail = require("../models/InventoryDetail");
const Product = require("../models/Product");
const inventoryService = require("../services/inventoryService");

class InventoryController {
  //[GET] inventory/
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;

      // Gọi service để xử lý logic
      const { inventories, counts } = await inventoryService.getAllInventories({
        filters,
        page: Number(page),
        limit: Number(limit),
      });

      res.status(200).json({
        success: inventories.length > 0,
        counts,
        inventories:
          inventories.length > 0 ? inventories : "No inventories found",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get inventories.",
        error: error.message,
      });
    }
  }

  //[GET] /inventory/by-time
  async getInventoryByTime(req, res) {
    try {
      const { startTime, endTime, ...filters } = req.query;

      if (!startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: "Please provide both startTime and endTime.",
        });
      }

      // Gọi service để xử lý logic
      const { inventories, counts } =
        await inventoryService.getInventoriesByTime({
          startTime,
          endTime,
          filters,
        });

      res.status(200).json({
        success: inventories.length > 0,
        counts,
        inventories:
          inventories.length > 0
            ? inventories
            : "No inventories found in the specified time range",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get inventories by time.",
        error: error.message,
      });
    }
  }

  //[POST] /inventory/create
  async createInventory(req, res) {
    try {
      const { note, details } = req.body;

      const inventory = await inventoryService.createInventory(note, details);

      res.status(200).json({
        success: true,
        message: "Inventory and stock updated successfully.",
        inventory,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create inventory.",
        error: error.message,
      });
    }
  }
}

module.exports = new InventoryController();
