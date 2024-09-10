class CartController {
  // [POST] /author/store
  async addProductToCart(req, res) {
    try {
      const { productId, quantity } = req.body;
      const user = req.user;
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {}
  }
}

module.exports = new CartController();
