const Product = require("../models/Product");
const Author = require("../models/Author");
const Category = require("../models/Category");
const Publisher = require("../models/Publisher");
const LineItem = require("../models/LineItem");

class ProductService {
  async getById(productId) {
    return await Product.findOne({ _id: productId })
      .populate("categories")
      .populate("author")
      .populate("publisher");
  }

  async getProducts(query) {
    const { filters, pagination, sorting, fields } = query;

    const queryCommand = Product.find(filters)
      .populate("categories")
      .populate("author")
      .populate("publisher");

    if (sorting) {
      queryCommand.sort(sorting);
    }

    if (fields) {
      queryCommand.select(fields);
    }

    if (pagination) {
      queryCommand.skip(pagination.skip).limit(pagination.limit);
    }

    const products = await queryCommand.exec();
    const counts = await Product.countDocuments(filters);

    return { products, counts };
  }

  async suggestProducts(filters, excludedIds, categories) {
    filters._id = { $nin: excludedIds };
    filters.categories = { $in: categories };

    return await Product.find(filters)
      .populate("categories")
      .populate("author")
      .populate("publisher");
  }

  async storeProduct(productData) {
    const product = new Product(productData);
    return await product.save();
  }

  async updateProduct(id, updates) {
    return await Product.findByIdAndUpdate(id, updates, { new: true })
      .populate("categories")
      .populate("author")
      .populate("publisher");
  }

  async deleteProduct(id) {
    await LineItem.updateMany({ product: id }, { product: null });
    return await Product.delete({ _id: id });
  }

  async forceDeleteProduct(id) {
    await LineItem.updateMany({ product: id }, { product: null });
    return await Product.deleteOne({ _id: id });
  }

  async restoreProduct(id) {
    await Product.restore({ _id: id });
    return await Product.findById(id);
  }
}

module.exports = new ProductService();
