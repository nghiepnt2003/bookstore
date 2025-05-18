const Inventory = require("../models/Inventory");
const InventoryDetail = require("../models/InventoryDetail");
const Product = require("../models/Product");

class InventoryService {
  async getAllInventories({ filters, page, limit }) {
    try {
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

      // Tìm dữ liệu inventory và populate thông tin product
      const inventories = await Inventory.find(formatedFilters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      for (const inventory of inventories) {
        inventory.inventoryDetails = await InventoryDetail.find({
          inventoryId: inventory._id,
        })
          .populate({
            path: "productId", // Tên trường được populate
            model: "Product",
          })
          .lean();
      }

      // Đếm tổng số lượng Inventory
      const counts = await Inventory.countDocuments(formatedFilters);

      return { inventories, counts };
    } catch (error) {
      throw new Error(`Failed to get inventories: ${error.message}`);
    }
  }

  async getInventoriesByTime({ startTime, endTime, filters }) {
    try {
      // Chuyển đổi thời gian thành kiểu Date
      const start = new Date(startTime);
      const end = new Date(new Date(endTime).setHours(23, 59, 59, 999));

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

      // Lấy dữ liệu inventory
      const inventories = await Inventory.find(formatedFilters)
        .sort({ createdAt: -1 })
        .lean();

      for (const inventory of inventories) {
        // Lấy thông tin chi tiết inventory và populate product
        inventory.inventoryDetails = await InventoryDetail.find({
          inventoryId: inventory._id,
        })
          .populate({
            path: "productId",
            model: "Product",
          })
          .lean();
      }

      // Đếm tổng số lượng Inventory
      const counts = await Inventory.countDocuments(formatedFilters);

      return { inventories, counts };
    } catch (error) {
      throw new Error(`Failed to get inventories by time: ${error.message}`);
    }
  }

  async createInventory(note, details) {
    if (!details || details.length === 0) {
      throw new Error("Inventory details are required.");
    }

    let totalCost = 0;

    const newInventory = new Inventory({
      totalCost: 0,
      note,
    });
    const savedInventory = await newInventory.save();

    for (const detail of details) {
      const { productId, quantity, unitCost } = detail;

      if (!productId || !quantity || !unitCost) {
        throw new Error("Product ID, quantity, and unitCost are required.");
      }

      const product = await Product.findById(productId);
      if (!product) {
        throw new Error(`Product with ID ${productId} not found.`);
      }
      if (unitCost >= product?.price) {
        throw new Error(
          `Cost price (${unitCost}) cannot be greater than or equal to selling price (${product.price}) for product ID: ${productId}.`
        );
      }
      totalCost += quantity * unitCost;

      await new InventoryDetail({
        inventoryId: savedInventory._id,
        productId,
        quantity,
        unitCost,
      }).save();

      await Product.findOneAndUpdate(
        { _id: productId },
        {
          $inc: { stockQuantity: Number(quantity) },
          $set: { lastRestocked: new Date(), costPrice: unitCost },
        },
        { new: true }
      );
    }

    savedInventory.totalCost = totalCost;
    await savedInventory.save();

    return savedInventory;
  }
}

module.exports = new InventoryService();
