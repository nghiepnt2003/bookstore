const Inventory = require("../models/Inventory");
const InventoryDetail = require("../models/InventoryDetail");
const Product = require("../models/Product");

class InventoryService {
  async getAllInventories({ filterQueries, limit, sort, page, fields }) {
    try {
      const skip = (page - 1) * limit || 0;

      // Xử lý các bộ lọc
      let queryString = JSON.stringify(filterQueries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedFilters = JSON.parse(queryString);

      // Lấy dữ liệu inventory
      const inventories = await Inventory.find(formatedFilters)
        .sort(sort ? JSON.parse(sort) : { createdAt: -1 })
        .skip(skip)
        .limit(Number(limit) || 10)
        .select(fields ? fields.split(",").join(" ") : "") // Lựa chọn các trường cần lấy
        .lean();

      // Đính kèm thông tin chi tiết từ InventoryDetail
      for (const inventory of inventories) {
        inventory.details = await InventoryDetail.find({
          inventoryId: inventory._id,
        })
          .populate({
            path: "productId",
            select: "name price category", // Lấy các trường cần thiết từ Product
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
  async getInventoryByTime(startTime, endTime, queryParams) {
    try {
      const start = new Date(startTime);
      const end = new Date(new Date(endTime).setHours(23, 59, 59, 999)); // Đặt thời gian cuối ngày

      // Chuẩn bị bộ lọc
      const filteredQueryParams = { ...queryParams };
      const excludeFields = [
        "sort",
        "fields",
        "page",
        "limit",
        "startTime",
        "endTime",
      ];
      excludeFields.forEach((el) => delete filteredQueryParams[el]);

      let queryString = JSON.stringify(filteredQueryParams).replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );
      const formatedQueries = JSON.parse(queryString);

      formatedQueries.createdAt = { $gte: start, $lte: end };

      // Tạo query với điều kiện
      let queryCommand = Inventory.find({ ...formatedQueries }).populate({
        path: "details",
        model: "InventoryDetail",
        populate: {
          path: "productId",
          model: "Product",
        },
      });

      // Sắp xếp nếu có tham số sort
      if (queryParams.sort) {
        const sortBy = queryParams.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Chọn các trường nếu có tham số fields
      if (queryParams.fields) {
        const fields = queryParams.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      // Phân trang
      const page = +queryParams.page || 1;
      const limit = +queryParams.limit || 10;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      // Thực thi query
      const response = await queryCommand.exec();

      // Tính tổng giá trị (totalCost) của tất cả inventories
      const totalCost = response.reduce(
        (sum, inventory) => sum + inventory.totalCost,
        0
      );

      // Đếm tổng số lượng inventories
      const counts = await Inventory.find({
        ...formatedQueries,
      }).countDocuments();

      return {
        success: response.length > 0,
        counts,
        totalCost,
        inventories: response.length > 0 ? response : "No inventories found.",
        message:
          response.length > 0
            ? "Inventories fetched successfully."
            : "No inventories found.",
      };
    } catch (error) {
      throw new Error(error.message);
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
