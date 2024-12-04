const Product = require("../models/Product");
const Author = require("../models/Author");
const Category = require("../models/Category");
const Publisher = require("../models/Publisher");
const LineItem = require("../models/LineItem");

class ProductService {
  async getById(productId) {
    try {
      const product = await Product.findOne({ _id: productId })
        .populate("categories") // Populate thông tin của các category
        .populate("author") // Populate thông tin của author nếu cần
        .populate("publisher"); // Populate thông tin của publisher nếu cần

      return { success: !!product, product };
    } catch (error) {
      throw error;
    }
  }
  async getProducts(queries) {
    try {
      // Tách các trường đặc biệt ra khỏi query
      const excludeFields = ["limit", "sort", "page", "fields"];
      excludeFields.forEach((el) => delete queries[el]);

      // Format lại các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(queries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      // Filtering theo tên sản phẩm
      if (queries?.name) {
        formatedQueries.name = { $regex: queries.name, $options: "i" };
      }

      // Lọc theo tên tác giả nếu có
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

      // Lọc theo tên category nếu có
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

      // Lọc theo tên nhà xuất bản nếu có
      if (queries.publisherName) {
        const publisher = await Publisher.findOne({
          name: { $regex: queries.publisherName, $options: "i" },
        }).select("_id");
        if (publisher) {
          formatedQueries.publisher = publisher._id;
        }
        delete formatedQueries.publisherName;
      }

      // Tạo query command
      let queryCommand = Product.find(formatedQueries)
        .populate("categories")
        .populate("author")
        .populate("publisher");

      // Sorting
      if (queries.sort) {
        const sortBy = queries.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // fields limiting
      if (queries.fields) {
        const fields = queries.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      // Pagination
      const page = +queries.page || 1;
      const limit = +queries.limit || process.env.LIMIT_PRODUCTS;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      // Execute query
      const products = await queryCommand.exec();

      // Đếm số lượng sản phẩm
      const counts = await Product.find(formatedQueries).countDocuments();

      return {
        success: products.length > 0,
        counts,
        products: products.length > 0 ? products : "Cannot get products",
      };
    } catch (error) {
      throw error;
    }
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
