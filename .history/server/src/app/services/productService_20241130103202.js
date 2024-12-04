const Product = require("../models/Product");
const Author = require("../models/Author");
const Publisher = require("../models/Publisher");
const Category = require("../models/Category");
const LineItem = require("../models/LineItem");
const cloudinary = require("cloudinary").v2;

class ProductService {
  async getProductById(productId) {
    return await Product.findOne({ _id: productId })
      .populate("categories")
      .populate("author")
      .populate("publisher");
  }

  async getFilteredProducts(queries) {
    const excludeFields = ["limit", "sort", "page", "fields"];
    excludeFields.forEach((el) => delete queries[el]);

    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (matchedEl) => `$${matchedEl}`
    );
    const formatedQueries = JSON.parse(queryString);

    if (queries?.name) {
      formatedQueries.name = { $regex: queries.name, $options: "i" };
    }

    if (queries.authorName) {
      const authors = await Author.find({
        name: { $regex: queries.authorName, $options: "i" },
      }).select("_id");
      const authorIds = authors.map((author) => author._id);
      if (authorIds.length > 0) {
        formatedQueries.author = { $in: authorIds };
      }
      delete formatedQueries.authorName;
    }

    if (queries.categoryName) {
      const categories = await Category.find({
        name: { $regex: queries.categoryName, $options: "i" },
      }).select("_id");
      const categoryIds = categories.map((category) => category._id);
      if (categoryIds.length > 0) {
        formatedQueries.categories = { $in: categoryIds };
      }
      delete formatedQueries.categoryName;
    }

    if (queries.publisherName) {
      const publisher = await Publisher.findOne({
        name: { $regex: queries.publisherName, $options: "i" },
      }).select("_id");
      if (publisher) {
        formatedQueries.publisher = publisher._id;
      }
      delete formatedQueries.publisherName;
    }

    return formatedQueries;
  }

  async paginateQuery(queryCommand, page, limit) {
    const skip = (page - 1) * limit;
    queryCommand.skip(skip).limit(limit);
    return queryCommand.exec();
  }

  async createProduct(productData) {
    const product = new Product(productData);
    return await product.save();
  }

  async updateProduct(productId, productData) {
    return await Product.findByIdAndUpdate(productId, productData, {
      new: true,
    })
      .populate("categories")
      .populate("author")
      .populate("publisher");
  }

  async deleteProductSoft(productId) {
    await LineItem.updateMany({ product: productId }, { product: null });
    return await Product.delete({ _id: productId });
  }

  async deleteProductHard(productId) {
    await LineItem.updateMany({ product: productId }, { product: null });
    return await Product.deleteOne({ _id: productId });
  }

  async restoreProduct(productId) {
    await Product.restore({ _id: productId });
    return await Product.findById(productId);
  }

  async uploadImage(file) {
    return file ? file.path : null;
  }
}

module.exports = new ProductService();
