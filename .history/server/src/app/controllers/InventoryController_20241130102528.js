const Inventory = require("../models/Inventory");
const InventoryDetail = require("../models/InventoryDetail");
const Product = require("../models/Product");
const InventoryService = require("../services/InventoryService");

class InventoryController {
  //[GET] inventory/
  async getAllInventory(req, res) {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const { inventories, counts } = await InventoryService.getAllInventory(
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
      // Lấy startTime và endTime từ query parameters
      const { startTime, endTime, ...filters } = req.query;

      // Kiểm tra nếu startTime hoặc endTime không được cung cấp
      if (!startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: "Please provide both startTime and endTime.",
        });
      }

      // Chuyển đổi startTime và endTime thành kiểu Date
      const start = new Date(startTime);
      const end = new Date(new Date(endTime).setHours(23, 59, 59, 999)); // Đặt thời gian cuối ngày

      // Chuyển đổi các operators cho đúng cú pháp MongoDB
      let queryString = JSON.stringify(filters);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      let formatedFilters = JSON.parse(queryString);

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

      // Thêm điều kiện thời gian
      formatedFilters.createdAt = { $gte: start, $lte: end };

      console.log("Filters applied:", formatedFilters);

      // Aggregation pipeline
      const inventories = await Inventory.aggregate([
        { $match: formatedFilters }, // Lọc Inventory theo các filters
        { $sort: { createdAt: -1 } }, // Sắp xếp theo thời gian tạo mới nhất
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

      // Validate input
      if (!details || details.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Inventory details are required.",
        });
      }

      // Initialize total cost
      let totalCost = 0;

      // Create the inventory document (without totalCost for now)
      const newInventory = new Inventory({
        totalCost: 0, // Temporary, will update later
        note,
      });
      const savedInventory = await newInventory.save();

      // Process each inventory detail and update product stock
      for (const detail of details) {
        const { productId, quantity, unitCost } = detail;

        if (!productId || !quantity || !unitCost) {
          return res.status(400).json({
            success: false,
            message: "Product ID and quantity and unitCost are required.",
          });
        }

        // Fetch product information
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product with ID ${productId} not found.`,
          });
        }

        // Use costPrice from the product as unitCost
        product.costPrice = unitCost;
        await product.save();

        // Calculate total cost
        totalCost += quantity * unitCost;

        // Create inventory detail
        const newInventoryDetail = new InventoryDetail({
          inventoryId: savedInventory._id, // Use the saved inventoryId
          productId,
          quantity,
          unitCost,
        });
        await newInventoryDetail.save();
        if (isNaN(quantity) || quantity <= 0) {
          throw new Error(`Invalid quantity for product ID ${productId}`);
        }
        console.log(
          `Before Update: Product ID ${productId}, Stock Quantity: ${product.stockQuantity}, Adding Quantity: ${quantity}`
        );
        // Update product stock and cost price
        // product.stockQuantity += quantity;
        // product.lastRestocked = new Date();
        await Product.findOneAndUpdate(
          { _id: productId },
          {
            $inc: { stockQuantity: Number(quantity) }, // Đảm bảo quantity là số
            $set: { lastRestocked: new Date() }, // Cập nhật thời gian nhập kho
          },
          { new: true }
        );
      }

      // Update totalCost in inventory
      savedInventory.totalCost = totalCost;
      await savedInventory.save();

      res.status(200).json({
        success: true,
        message: "Inventory and stock updated successfully.",
        inventory: savedInventory,
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
