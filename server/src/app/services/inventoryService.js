const Inventory = require("../models/Inventory");
const InventoryDetail = require("../models/InventoryDetail");
const Product = require("../models/Product");

class InventoryService {
  async getAllInventory(filters, page, limit) {
    const skip = (page - 1) * limit;

    // Chuyển đổi các operators cho đúng cú pháp MongoDB
    let queryString = JSON.stringify(filters);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
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

    const inventories = await Inventory.aggregate([
      { $match: formatedFilters },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: +limit },
      {
        $lookup: {
          from: "inventorydetails",
          localField: "_id",
          foreignField: "inventoryId",
          as: "inventoryDetails",
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

    const counts = await Inventory.countDocuments(formatedFilters);

    return { inventories, counts };
  }

  async getInventoryByTime(filters, startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(new Date(endTime).setHours(23, 59, 59, 999));

    filters.createdAt = { $gte: start, $lte: end };

    const inventories = await Inventory.aggregate([
      { $match: filters },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "inventorydetails",
          localField: "_id",
          foreignField: "inventoryId",
          as: "inventoryDetails",
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

    const counts = await Inventory.countDocuments(filters);

    return { inventories, counts };
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
          $set: { lastRestocked: new Date() },
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
