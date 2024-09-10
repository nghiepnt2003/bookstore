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
    } catch (error) {}
  }
}

module.exports = new CartController();
