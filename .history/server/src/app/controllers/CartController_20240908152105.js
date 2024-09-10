const Cart = require("../models/Cart");
const LineItem = require("../models/LineItem");
const Product = require("../models/Product");
class CartController {
  // [POST] /cart/addProductToCart
  async addProductToCart(req, res) {
    try {
      let { productId, quantity } = req.body;
      if (!productId || !quantity || isNaN(productId) || isNaN(quantity)) {
        return res
          .status(400)
          .json({ message: "Invalid product ID or quantity" });
      }
      productId = parseInt(productId, 10); // Chuyển productId thành số nguyên
      quantity = parseInt(quantity, 10); // Chuyển quantity thành số nguyên
      // Kiểm tra nếu productId hoặc quantity không phải là số hợp lệ
      // if (isNaN(productId) || isNaN(quantity) || quantity <= 0) {
      //   return res
      //     .status(400)
      //     .json({ message: "Invalid product ID or quantity" });
      // }
      const userId = req.user._id;
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      // Tìm cart của user hiện tại
      let cart = await Cart.findOne({ user: userId }).populate("items");
      //   let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        // Nếu không có cart, tạo mới một cart cho user
        cart = new Cart({
          user: userId,
          items: [],
        });
      }
      // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
      let existingLineItem = await LineItem.findOne({
        _id: { $in: cart.items }, // Tìm trong các LineItem của cart
        product,
      });
      if (existingLineItem) {
        // Nếu đã tồn tại, cập nhật số lượng
        existingLineItem.quantity += quantity;
        await existingLineItem.save();
      } else {
        // Nếu chưa tồn tại, tạo một LineItem mới
        const newLineItem = new LineItem({
          product,
          quantity,
        });
        await newLineItem.save();
        // Thêm LineItem mới vào cart
        cart.items.push(newLineItem._id);
      }
      await cart.save();
      return res.status(200).json({ message: "Product added to cart", cart });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  }

  //[PUT] /cart/updateProductQuantityInCart
  async updateProductQuantityInCart(req, res) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user._id; // Assume the user is authenticated and req.user is available.

      // Validate quantity
      if (quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }

      // Find user's cart
      let cart = await Cart.findOne({ user: userId }).populate("items");
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      // Find the LineItem in cart.items that matches the given productId
      let existingLineItem = await LineItem.findOne({
        _id: { $in: cart.items }, // Find in the cart's items
        product: productId,
      });

      if (!existingLineItem) {
        return res.status(404).json({ message: "Product not found in cart" });
      }

      // Update quantity
      existingLineItem.quantity = quantity;
      await existingLineItem.save();

      return res
        .status(200)
        .json({ message: "Product quantity updated", cart });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  }
}

module.exports = new CartController();
