const Inventory = require("../models/Inventory");
const InventoryDetail = require("../models/InventoryDetail");
const Product = require("../models/Product");
const inventoryService = require("../services/InventoryService");

class InventoryController {
  //[GET] inventory/
  // async getAllInventory(req, res) {
  //   try {
  //     const { page = 1, limit = 10, ...filters } = req.query;
  //     const { inventories, counts } = await inventoryService.getAllInventory(
  //       filters,
  //       page,
  //       limit
  //     );

  //     res.status(200).json({
  //       success: inventories.length > 0,
  //       counts,
  //       inventories:
  //         inventories.length > 0 ? inventories : "No inventories found",
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message: "Failed to get inventories.",
  //       error: error.message,
  //     });
  //   }
  // }

  async getAllInventory(req, res) {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const skip = (page - 1) * limit;

      // Chuyển đổi các operators cho đúng cú pháp MongoDB
      let queryString = JSON.stringify(filters);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      let formatedFilters = JSON.parse(queryString);
      if (filters.note) {
        formatedFilters.note = { $regex: filters.note, $options: "i" }; // Tìm kiếm không phân biệt hoa thường
      }

      // Ép kiểu giá trị thành số nếu có thể
      formatedFilters = Object.fromEntries(
        Object.entries(formatedFilters).map(([key, value]) => {
          if (typeof value === "object") {
            return [
              key,
              Object.fromEntries(
                Object.entries(value).map(([operator, val]) => [
                  operator,
                  isNaN(val) ? val : Number(val),
                ])
              ),
            ];
          }
          return [key, isNaN(value) ? value : Number(value)];
        })
      );

      console.log("Filters applied:", formatedFilters);

      // Aggregation pipeline
      const inventories = await Inventory.aggregate([
        { $match: formatedFilters }, // Lọc Inventory theo các filters
        { $sort: { createdAt: -1 } }, // Sắp xếp theo thời gian tạo mới nhất
        { $skip: skip }, // Phân trang
        { $limit: +limit }, // Giới hạn số lượng tài liệu
        {
          $lookup: {
            from: "inventorydetails", // Tên collection InventoryDetail
            localField: "_id", // Trường `_id` của Inventory
            foreignField: "inventoryId", // Trường `inventoryId` của InventoryDetail
            as: "inventoryDetails", // Tên trường kết quả
          },
        },
        {
          $project: {
            totalCost: 1,
            note: 1,
            createdAt: 1,
            updatedAt: 1,
            inventoryDetails: {
              productId: 1,
              quantity: 1,
              unitCost: 1,
            },
          },
        },
      ]);

      // Đếm tổng số lượng Inventory
      const counts = await Inventory.countDocuments(formatedFilters);

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

      const { inventories, counts } = await inventoryService.getInventoryByTime(
        filters,
        startTime,
        endTime
      );

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
