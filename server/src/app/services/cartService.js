const Cart = require("../models/Cart");
const LineItem = require("../models/LineItem");
const Member = require("../models/Member");
const Product = require("../models/Product");
const User = require("../models/User");

class CartService {
  async getCart(userId) {
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items",
      populate: {
        path: "product",
        model: "Product",
        populate: [
          { path: "author", select: "name" },
          { path: "publisher", select: "name" },
          { path: "categories", select: "name" },
        ],
      },
    });
    if (!cart) return null;
    // Tính finalPrice cho từng sản phẩm
    const itemsWithFinalPrice = await Promise.all(
      cart.items.map(async (item) => {
        const finalPrice = await item.product.getFinalPrice();
        return { ...item._doc, finalPrice };
      })
    );

    return { ...cart._doc, items: itemsWithFinalPrice };
  }

  async getCartSummary(userId) {
    const userInfo = await User.findById(userId).select("member");
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items",
      populate: {
        path: "product",
        select: "name price discount",
      },
    });
    if (!cart) return null;

    const totalQuantity = cart.items.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    const itemsWithFinalPrice = await Promise.all(
      cart.items.map(async (item) => {
        const finalPrice = await item.product.getFinalPrice();
        return { ...item._doc, finalPrice };
      })
    );

    let totalPrice = itemsWithFinalPrice.reduce(
      (acc, item) => acc + item.finalPrice * item.quantity,
      0
    );

    const member = await Member.findById(userInfo.member);
    if (member) {
      if (member.rank === "Silver") totalPrice *= 0.98;
      else if (member.rank === "Gold") totalPrice *= 0.95;
      else if (member.rank === "Diamond") totalPrice *= 0.9;
    }

    return {
      totalQuantity,
      totalPrice: Math.round(totalPrice * 100) / 100,
      items: itemsWithFinalPrice,
    };
  }

  async addProductToCart(userId, productId, quantity) {
    if (!productId || !quantity || isNaN(productId) || isNaN(quantity)) {
      throw new Error("Invalid product ID or quantity");
    }

    productId = parseInt(productId, 10);
    quantity = parseInt(quantity, 10);
    const product = await Product.findById(productId).populate("categories");
    if (!product) return null;

    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items",
      populate: { path: "product", model: "Product" },
    });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }
    if (quantity > product.stockQuantity) {
      throw new Error(`Only ${product.stockQuantity} items available in stock`);
    }

    let existingLineItem = await LineItem.findOne({
      _id: { $in: cart.items },
      product,
    });

    if (existingLineItem) {
      const newQuantity = existingLineItem.quantity + quantity;
      console.log(existingLineItem.quantity, quantity);
      if (newQuantity > product.stockQuantity) return "EXCEED_STOCK";
      existingLineItem.quantity = newQuantity;
      await existingLineItem.save();
    } else {
      const newLineItem = new LineItem({ product, quantity });
      await newLineItem.save();
      cart.items.push(newLineItem._id);
    }

    await cart.save();
    return cart.populate({
      path: "items",
      populate: { path: "product", model: "Product" },
    });
  }

  async updateCartItem(userId, productId, quantity) {
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items",
      populate: { path: "product", model: "Product" },
    });

    if (!cart) return null;

    const existingLineItem = await LineItem.findOne({
      _id: { $in: cart.items },
      product: productId,
    });

    if (!existingLineItem) return null;

    if (quantity < 1) {
      await LineItem.deleteOne({ _id: existingLineItem._id });
      cart.items = cart.items.filter(
        (item) => item.toString() !== existingLineItem._id.toString()
      );
    } else {
      existingLineItem.quantity = quantity;
      await existingLineItem.save();
    }

    await cart.save();
    return cart.populate({
      path: "items",
      populate: { path: "product", model: "Product" },
    });
  }

  async updateSelectedForCheckout(userId, lineItemId, selectedForCheckout) {
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items",
      populate: {
        path: "product",
        model: "Product",
        populate: { path: "categories" },
      },
    });

    if (!cart) return { error: "Cart not found" };

    const lineItem = cart.items.find(
      (item) => item._id.toString() === lineItemId
    );

    if (!lineItem) return { error: "LineItem not found" };

    lineItem.selectedForCheckout = selectedForCheckout || false;
    await lineItem.save();

    const selectedItems = cart.items.filter((item) => item.selectedForCheckout);

    let totalPrice = 0;
    for (let item of selectedItems) {
      const product = await item.product.populate("discount");
      const finalPrice = await product.getFinalPrice();
      totalPrice += finalPrice * item.quantity;
    }

    return {
      lineItem,
      totalPrice: Math.round(totalPrice * 100) / 100, // Ensure two decimal places
    };
  }

  async deleteCartItem(userId, itemId) {
    const cart = await Cart.findOne({ user: userId }).populate("items");
    if (!cart) return null;

    const existingLineItem = cart.items.find(
      (lineItem) => lineItem._id.toString() === itemId
    );

    if (!existingLineItem) return null;

    await LineItem.deleteOne({ _id: itemId });
    cart.items = cart.items.filter(
      (lineItem) => lineItem._id.toString() !== itemId
    );
    await cart.save();
    return cart.populate("items");
  }

  async clearCart(userId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;

    await LineItem.deleteMany({ _id: { $in: cart.items } });
    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
    return Cart.findOne({ user: userId }).populate("items");
  }
}

module.exports = new CartService();
