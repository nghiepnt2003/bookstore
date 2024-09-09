class CartController {
  // [POST] /author/store
  async addProductToCart(req, res) {
    try {
      const { productId, quantity } = req.body;
    } catch (error) {}
  }
}

module.exports = new CartController();
