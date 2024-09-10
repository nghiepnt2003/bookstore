const Cart = require("../models/Cart");
const LineItem = require("../models/LineItem");
const Product = require("../models/Product");
class CartController {
  //[GET] /cart
  async getCart(req, res) {
    try {
      const userId = req.user._id;
      let cart = await Cart.findOne({ user: userId }).populate("items");
      if (!cart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      }
      return res.status(200).json({ success: true, cart });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Server error : ", error });
    }
  }

  // [POST] /cart/items
  async addProductToCart(req, res) {
    try {
      let { productId, quantity } = req.body;
      if (!productId || !quantity || isNaN(productId) || isNaN(quantity)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product ID or quantity" });
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
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
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
      // Load lại cart để đảm bảo có dữ liệu mới nhất
      cart = await Cart.findOne({ user: userId }).populate("items");
      return res
        .status(200)
        .json({ success: true, message: "Product added to cart", cart });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Server error", error });
    }
  }

  //[PUT] /cart/items/
  async updateCartItem(req, res) {
    try {
      let { productId, quantity } = req.body;
      if (!productId || !quantity || isNaN(productId) || isNaN(quantity)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product ID or quantity" });
      }
      productId = parseInt(productId, 10); // Chuyển productId thành số nguyên
      quantity = parseInt(quantity, 10); // Chuyển quantity thành số nguyên

      const userId = req.user._id;
      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      // Tìm cart của user hiện tại
      let cart = await Cart.findOne({ user: userId }).populate("items");
      if (!cart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      }

      // Kiểm tra xem sản phẩm có tồn tại trong giỏ hàng không
      let existingLineItem = await LineItem.findOne({
        _id: { $in: cart.items }, // Tìm trong các LineItem của cart
        product,
      });
      if (!existingLineItem) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found in cart" });
      }
      if (quantity < 1) {
        // Nếu quantity < 1, xóa LineItem
        await LineItem.deleteOne({ _id: existingLineItem._id });
        // Xóa LineItem khỏi danh sách items trong cart
        cart.items = cart.items.filter(
          (item) => item.toString() !== existingLineItem._id.toString()
        );
        await cart.save();
      } else {
        // Cập nhật số lượng sản phẩm
        existingLineItem.quantity = quantity;
        await existingLineItem.save();
      }

      cart = await Cart.findOne({ user: userId }).populate("items");

      return res
        .status(200)
        .json({ success: true, message: "Product quantity updated", cart });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Server error", error });
    }
  }
  //[DELETE] /cart/items/:item
  async deleteCartItem(req, res) {
    try {
      const { item } = req.params; // Lấy ID của LineItem từ URL params
      if (!item || isNaN(item)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid item ID" });
      }

      const userId = req.user._id;

      // Tìm cart của user hiện tại
      let cart = await Cart.findOne({ user: userId }).populate("items");
      if (!cart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      }

      // Kiểm tra xem LineItem có tồn tại trong giỏ hàng không
      const existingLineItem = cart.items.find(
        (lineItem) => lineItem._id.toString() === item
      );
      if (!existingLineItem) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found in cart" });
      }

      // Xóa LineItem khỏi giỏ hàng
      await LineItem.deleteOne({ _id: item });

      // Cập nhật giỏ hàng để xóa LineItem khỏi danh sách items
      cart.items = cart.items.filter(
        (lineItem) => lineItem._id.toString() !== item
      );
      await cart.save();
      cart = await Cart.findOne({ user: userId }).populate("items");

      return res
        .status(200)
        .json({ success: true, message: "Item removed from cart", cart });
    } catch (error) {
      console.error("Error deleting cart item:", error);
      return res
        .status(500)
        .json({ success: false, message: "Server error", error });
    }
  }
  //[DELETE] /cart
  async clearCart(req, res) {
    try {
      const userId = req.user._id;
      await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
      return res.status(200).json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      return res.status(500).json({ message: "Server error", error });
    }
  }
}

module.exports = new CartController();
