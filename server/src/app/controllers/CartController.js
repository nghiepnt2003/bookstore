const Cart = require("../models/Cart");
const LineItem = require("../models/LineItem");
const Member = require("../models/Member");
const Product = require("../models/Product");
const User = require("../models/User");
const cartService = require("../services/cartService");

class CartController {
  //[GET] /cart
  async getCart(req, res) {
    try {
      const cart = await cartService.getCart(req.user._id);
      if (!cart)
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      return res.status(200).json({ success: true, cart });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Server error", error });
    }
  }

  // [GET] /cart/summary
  async getCartSummary(req, res) {
    try {
      const summary = await cartService.getCartSummary(req.user._id);
      if (!summary)
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      return res.status(200).json({ success: true, ...summary });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Server error", error });
    }
  }

  // [POST] /cart/items
  async addProductToCart(req, res) {
    try {
      const { productId, quantity } = req.body;
      const result = await cartService.addProductToCart(
        req.user._id,
        productId,
        quantity
      );

      if (result === "EXCEED_STOCK") {
        return res
          .status(400)
          .json({ success: false, message: "Insufficient stock" });
      }
      if (!result)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });

      return res
        .status(200)
        .json({ success: true, message: "Product added", cart: result });
    } catch (error) {
      {
        return res.status(400).json({
          success: false,
          message: error.message || "Something went wrong",
        });
      }
    }
  }

  // [PUT] /cart/items
  async updateCartItem(req, res) {
    try {
      const { productId, quantity } = req.body;
      const cart = await cartService.updateCartItem(
        req.user._id,
        productId,
        quantity
      );

      if (!cart)
        return res
          .status(404)
          .json({ success: false, message: "Cart or product not found" });

      return res
        .status(200)
        .json({ success: true, message: "Product updated", cart });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Server error", error });
    }
  }

  //[PUT] /cart/item/:id/checkout
  async updateSelectedForCheckout(req, res) {
    try {
      const userId = req.user._id;
      const lineItemId = req.params.id;
      const { selectedForCheckout } = req.body;

      const result = await cartService.updateSelectedForCheckout(
        userId,
        lineItemId,
        selectedForCheckout
      );

      if (result.error) {
        return res.status(404).json({ success: false, message: result.error });
      }

      return res.status(200).json({
        success: true,
        message: "LineItem updated successfully, ready to checkout",
        lineItem: result.lineItem,
        totalPrice: result.totalPrice,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  //[DELETE] /cart/items/:item
  async deleteCartItem(req, res) {
    try {
      const cart = await cartService.deleteCartItem(
        req.user._id,
        req.params.item
      );
      if (!cart)
        return res
          .status(404)
          .json({ success: false, message: "Cart or item not found" });

      return res
        .status(200)
        .json({ success: true, message: "Item removed", cart });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Server error", error });
    }
  }
  //[DELETE] /cart
  async clearCart(req, res) {
    try {
      const userId = req.user._id;
      let cart = await Cart.findOne({ user: userId });

      if (!cart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      }
      // Xóa tất cả các LineItem liên quan đến giỏ hàng
      await LineItem.deleteMany({ _id: { $in: cart.items } });

      await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
      cart = await Cart.findOne({ user: userId }).populate("items");

      return res
        .status(200)
        .json({ success: true, message: "Cart cleared", cart });
    } catch (error) {
      console.error("Error clearing cart:", error);
      return res
        .status(500)
        .json({ success: false, message: "Server error", error });
    }
  }
}

module.exports = new CartController();
