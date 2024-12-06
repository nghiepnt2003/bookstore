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
      const { startTime, endTime, sort, fields, ...queries } = req.query;

      // Kiểm tra nếu startTime hoặc endTime không được cung cấp
      if (!startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: "Please provide both startTime and endTime.",
        });
      }

      // Chuyển đổi startTime và endTime thành kiểu Date
      const start = new Date(startTime);
      const end = new Date(new Date(endTime).setHours(23, 59, 59, 999));

      // Loại bỏ các trường đặc biệt không phải filter
      const excludeFields = ["limit", "sort", "page", "fields"];
      excludeFields.forEach((el) => delete queries[el]);

      // Chuyển đổi các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(queries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      // Lọc trạng thái (nếu có)
      if (queries?.status) {
        formatedQueries.status = { $regex: queries.status, $options: "i" };
      }

      // Thêm điều kiện thời gian
      formatedQueries.createdAt = { $gte: start, $lte: end };

      // Execute query với aggregation
      let aggregationPipeline = [
        { $match: formatedQueries }, // Lọc Inventory
      ];

      // Sắp xếp nếu có tham số sort
      if (sort) {
        const sortFields = sort.split(",").reduce((acc, field) => {
          const direction = field.startsWith("-") ? -1 : 1;
          acc[field.replace("-", "")] = direction;
          return acc;
        }, {});
        aggregationPipeline.push({ $sort: sortFields });
      } else {
        aggregationPipeline.push({ $sort: { createdAt: -1 } }); // Mặc định sắp xếp giảm dần
      }

      // Phân trang
      const page = +req.query.page || 1;
      const limit = +req.query.limit || process.env.LIMIT_ORDERS || 10;
      const skip = (page - 1) * limit;
      aggregationPipeline.push({ $skip: skip }, { $limit: limit });

      // Lấy các trường cụ thể nếu có fields
      if (fields) {
        const selectedFields = fields.split(",").reduce((acc, field) => {
          acc[field] = 1;
          return acc;
        }, {});
        aggregationPipeline.push({ $project: selectedFields });
      } else {
        aggregationPipeline.push({
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
        });
      }

      // Thực hiện aggregation
      const inventories = await Inventory.aggregate(aggregationPipeline);

      // Đếm tổng số lượng Inventory
      const counts = await Inventory.countDocuments(formatedQueries);

      res.status(200).json({
        success: inventories.length > 0,
        counts,
        inventories:
          inventories.length > 0 ? inventories : "No inventories found.",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get inventories by admin.",
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
