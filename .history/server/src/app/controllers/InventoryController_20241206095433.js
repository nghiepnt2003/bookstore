const Inventory = require("../models/Inventory");
const InventoryDetail = require("../models/InventoryDetail");
const Product = require("../models/Product");
const inventoryService = require("../services/InventoryService");

class InventoryController {
  //[GET] inventory/
  async getAllInventory(req, res) {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const { inventories, counts } = await inventoryService.getAllInventory(
        filters,
        page,
        limit
      );

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
      const { startTime, endTime, ...queryParams } = req.query;

      // Kiểm tra startTime và endTime
      if (!startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: "Please provide both startTime and endTime.",
        });
      }

      const { success, counts, totalCost, inventories, message } =
        await inventoryService.getAllInventory(startTime, endTime, queryParams);

      res.status(success ? 200 : 404).json({
        success,
        counts,
        totalCost,
        inventories,
        message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch inventories.",
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
