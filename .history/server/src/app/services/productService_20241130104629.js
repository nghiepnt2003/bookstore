const Product = require("../models/Product");
const Author = require("../models/Author");
const Category = require("../models/Category");
const Publisher = require("../models/Publisher");
const LineItem = require("../models/LineItem");

class ProductService {
  async getById(productId) {
    return Product.findOne({ _id: productId })
      .populate("categories")
      .populate("author")
      .populate("publisher");
  }

  async getProducts(queries) {
    // Process queries, filtering, pagination, etc.
    const excludeFields = ["limit", "sort", "page", "fields"];
    excludeFields.forEach((el) => delete queries[el]);

    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    );
    const formatedQueries = JSON.parse(queryString);

    if (queries.name) {
      formatedQueries.name = { $regex: queries.name, $options: "i" };
    }

    return {
      products: Product.find(formatedQueries)
        .populate("categories")
        .populate("author")
        .populate("publisher"),
      count: Product.find(formatedQueries).countDocuments(),
    };
  }

  async suggestProducts(user, queries) {
    const wishListProductIds = user.wishList.map((product) => product._id);

    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    );
    const formatedQueries = JSON.parse(queryString);

    formatedQueries.categories = {
      $in: user.wishList.flatMap((product) => product.categories),
    };
    formatedQueries._id = { $nin: wishListProductIds };

    return Product.find(formatedQueries)
      .populate("categories")
      .populate("author")
      .populate("publisher");
  }

  async suggestPopularProducts(user, queries) {
    const wishListCategoryIds = user.wishList.flatMap(
      (product) => product.categories
    );

    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    );
    const formatedQueries = JSON.parse(queryString);

    formatedQueries.categories = { $in: wishListCategoryIds };

    return Product.find(formatedQueries)
      .sort({ soldCount: -1, averageRating: -1 })
      .populate("author categories publisher");
  }

  async storeProduct(productData) {
    const product = new Product(productData);
    return product.save();
  }

  async updateProduct(productId, updates) {
    return Product.findByIdAndUpdate(productId, updates, { new: true })
      .populate("categories")
      .populate("author")
      .populate("publisher");
  }

  async deleteProduct(productId) {
    await LineItem.updateMany({ product: productId }, { product: null });
    return Product.delete({ _id: productId });
  }

  async forceDeleteProduct(productId) {
    await LineItem.updateMany({ product: productId }, { product: null });
    return Product.deleteOne({ _id: productId });
  }

  async restoreProduct(productId) {
    await Product.restore({ _id: productId });
    return Product.findById(productId);
  }
}

module.exports = new ProductService();
