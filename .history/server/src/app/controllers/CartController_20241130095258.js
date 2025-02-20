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
      const product = await Product.findById(productId).populate("categories");
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      // Tìm cart của user hiện tại
      let cart = await Cart.findOne({ user: userId }).populate({
        path: "items",
        populate: {
          path: "product",
          model: "Product",
          populate: { path: "categories" },
        }, // Populate thông tin sản phẩm đầy đủ
      });
      if (quantity > product.stockQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stockQuantity} items available in stock`,
        });
      }
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
        // // Nếu đã tồn tại, cập nhật số lượng
        // existingLineItem.quantity += quantity;
        // Nếu sản phẩm đã tồn tại, cập nhật số lượng
        const newQuantity = existingLineItem.quantity + quantity;
        // Kiểm tra tồn kho với số lượng mới
        if (newQuantity > product.stockQuantity) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stockQuantity} items available in stock`,
          });
        }

        existingLineItem.quantity = newQuantity;
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
      cart = await Cart.findOne({ user: userId }).populate({
        path: "items",
        populate: {
          path: "product",
          model: "Product",
          populate: { path: "categories" },
        }, // Populate thông tin sản phẩm đầy đủ
      });
      return res
        .status(200)
        .json({ success: true, message: "Product added to cart", cart });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Server error", error });
    }
  }

  async updateCartItem(req, res) {
    try {
      let { productId, quantity } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!productId || !quantity || isNaN(productId) || isNaN(quantity)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID or quantity",
        });
      }

      productId = parseInt(productId, 10); // Chuyển productId thành số nguyên
      quantity = parseInt(quantity, 10); // Chuyển quantity thành số nguyên

      const userId = req.user._id;

      // Tìm sản phẩm trong danh sách Product
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
      if (quantity > product.stockQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stockQuantity} items available in stock`,
        });
      }

      // Tìm giỏ hàng của user hiện tại
      let cart = await Cart.findOne({ user: userId }).populate({
        path: "items",
        populate: {
          path: "product", // Populate thông tin sản phẩm
          model: "Product", // Model Product
          populate: { path: "categories" },
        },
      });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }

      // Tìm LineItem trong giỏ hàng, kiểm tra nếu LineItem.product có thể bị null
      let existingLineItem = await LineItem.findOne({
        _id: { $in: cart.items }, // Tìm trong các LineItem của cart
        $or: [
          { product: productId }, // Trường hợp product tồn tại
          { product: null }, // Trường hợp product bị null
        ],
      });

      if (!existingLineItem) {
        return res.status(404).json({
          success: false,
          message: "Product not found in cart",
        });
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
        // Cập nhật số lượng sản phẩm trong LineItem
        existingLineItem.quantity = quantity;
        await existingLineItem.save();
      }

      // Tìm lại giỏ hàng sau khi cập nhật
      cart = await Cart.findOne({ user: userId }).populate({
        path: "items",
        populate: {
          path: "product",
          model: "Product",
          populate: { path: "categories" },
        },
      });

      return res.status(200).json({
        success: true,
        message: "Product quantity updated",
        cart,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  //[PUT] /cart/item/:id/checkout
  async updateSelectedForCheckout(req, res) {
    try {
      const userId = req.user._id; // Giả sử bạn có user id trong req.user sau khi xác thực
      const lineItemId = req.params.id;
      const { selectedForCheckout } = req.body;

      // Tìm giỏ hàng của user
      const cart = await Cart.findOne({ user: userId }).populate({
        path: "items",
        populate: {
          path: "product",
          model: "Product",
          populate: { path: "categories" },
        },
      });

      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      // Tìm LineItem trong giỏ hàng
      const lineItem = cart.items.find(
        (item) => item._id.toString() === lineItemId
      );

      if (!lineItem) {
        return res
          .status(404)
          .json({ success: false, message: "LineItem not found" });
      }

      // Cập nhật thuộc tính selectedForCheckout
      lineItem.selectedForCheckout = selectedForCheckout
        ? selectedForCheckout
        : false;

      // Lưu lại thay đổi
      await lineItem.save();

      // Tính tổng giá tiền của các LineItem được chọn để thanh toán
      const selectedItems = cart.items.filter(
        (item) => item.selectedForCheckout
      );

      let totalPrice = 0;

      for (let item of selectedItems) {
        // Lấy giá sản phẩm sau khi đã kiểm tra discount
        const product = await item.product.populate("discount"); // Populate thêm discount nếu có
        const finalPrice = await product.getFinalPrice();

        // Tính tổng tiền cho các sản phẩm đã chọn
        totalPrice += finalPrice * item.quantity;
      }
      res.status(200).json({
        success: true,
        message: "LineItem updated successfully, ready to checkout : ",
        lineItem,
        totalPrice: totalPrice, // Trả về tổng giá tiền (định dạng 2 chữ số sau dấu thập phân)
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

      // // Kiểm tra xem LineItem có tồn tại trong giỏ hàng không
      // const existingLineItem = cart.items.find(
      //   (lineItem) => lineItem._id.toString() === item
      // );

      // Kiểm tra xem LineItem có tồn tại trong giỏ hàng không
      const existingLineItem = cart.items.find((lineItem) => {
        const isMatch = lineItem._id.toString() === item;
        console.log(
          `Checking LineItem: ${lineItem._id.toString()} against item: ${item}, Match: ${isMatch}`
        );
        return isMatch;
      });

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
