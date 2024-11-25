const Inventory = require("../models/Inventory");

class InventoryController {
  async store(req, res) {
    try {
      Cloud.single("image")(req, res, async (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            message: "Error uploading image",
            error: err.message,
          });
        }
        const {
          name,
          price,
          costPrice,
          pageNumber,
          author,
          publisher,
          categories,
        } = req.body;
        if (Object.keys(req.body).length === 0)
          return res
            .status(400)
            .json({ success: false, message: "Missing inputs" });

        if (
          !name ||
          !price ||
          !costPrice ||
          !pageNumber ||
          !author ||
          !publisher ||
          !categories
        ) {
          return res
            .status(400)
            .json({ success: false, message: "Missing inputs" });
        }

        // Kiểm tra costPrice < price
        if (costPrice >= price) {
          return res.status(400).json({
            success: false,
            message: "Cost price must be smaller than the selling price.",
          });
        }

        // Nếu có file ảnh, lưu URL vào req.body
        if (req.file && req.file.path) {
          req.body.image = req.file.path; // URL ảnh trên Cloudinary
        }
        const product = new Product(req.body);
        const savedProduct = await product.save();

        // Trả về tài liệu đã lưu thành công
        res.status(200).json({
          success: true,
          message: "Create product successful",
          data: savedProduct,
        });
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred " + err });
    }
  }
}

module.exports = new InventoryController();
