class CartController {
  // [POST] /author/store
  async addProductToCart(req, res) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user.id;
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      // Tìm cart của user hiện tại
      let cart = await Cart.findOne({ user: userId }).populate("items");
      if (!cart) {
        // Nếu không có cart, tạo mới một cart cho user
        cart = new Cart({
          user: userId,
          items: [],
        });
      }
      // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
      let existingLineItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingLineItem) {
        // Nếu đã tồn tại, cập nhật số lượng
        existingLineItem.quantity += quantity;
        await existingLineItem.save();
      } else {
        // Nếu chưa tồn tại, tạo một LineItem mới
        const newLineItem = new LineItem({
          product: productId,
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
}

module.exports = new CartController();