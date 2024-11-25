const Inventory = require("../models/Inventory");
const InventoryDetail = require("../models/InventoryDetail");
const Product = require("../models/Product");

class InventoryController {
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
        const { productId, quantity } = detail;

        if (!productId || !quantity) {
          return res.status(400).json({
            success: false,
            message: "Product ID and quantity are required.",
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
        const unitCost = product.costPrice;

        if (!unitCost) {
          return res.status(400).json({
            success: false,
            message: `Product with ID ${productId} does not have a valid costPrice.`,
          });
        }

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

        // Update product stock and cost price
        product.stockQuantity += quantity;
        product.lastRestocked = new Date();
        await product.save();
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
