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

  async suggestProducts(userId, queries) {
    try {
      // Lấy thông tin user và wishlist
      const user = await User.findById(userId).populate("wishList");
      const wishListProductIds = user.wishList.map((product) => product._id);

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

      // Lọc theo tên tác giả
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

      // Lọc theo tên category
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

      // Lọc theo tên nhà xuất bản
      if (queries.publisherName) {
        const publisher = await Publisher.findOne({
          name: { $regex: queries.publisherName, $options: "i" },
        }).select("_id");
        if (publisher) {
          formatedQueries.publisher = publisher._id;
        }
        delete formatedQueries.publisherName;
      }

      // Thêm điều kiện lọc theo danh mục sản phẩm trong wishlist
      formatedQueries.categories = {
        $in: user.wishList.flatMap((product) => product.categories),
      };

      // Loại bỏ sản phẩm đã có trong wishlist
      formatedQueries._id = { $nin: wishListProductIds };

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

      // Lấy danh sách sản phẩm gợi ý
      const suggestedProducts = await queryCommand.exec();

      // Lấy số lượng sản phẩm gợi ý
      const counts = await Product.find(formatedQueries).countDocuments();

      return {
        success: suggestedProducts.length > 0,
        counts,
        suggestedProducts:
          suggestedProducts.length > 0 ? suggestedProducts : [],
      };
    } catch (error) {
      throw error;
    }
  }

  async suggestPopularProducts(userId, queries) {
    try {
      // Lấy thông tin user và wishlist
      const user = await User.findById(userId).populate("wishList");
      const wishListCategoryIds = user.wishList.flatMap(
        (product) => product.categories
      );

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
      if (queries.name) {
        formatedQueries.name = { $regex: queries.name, $options: "i" };
      }

      // Lọc theo tên tác giả
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

      // Lọc theo tên category
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

      // Lọc theo nhà xuất bản
      if (queries.publisherName) {
        const publisher = await Publisher.findOne({
          name: { $regex: queries.publisherName, $options: "i" },
        }).select("_id");
        if (publisher) {
          formatedQueries.publisher = publisher._id;
        }
        delete formatedQueries.publisherName;
      }

      // Thêm điều kiện lọc theo danh mục sản phẩm trong wishlist
      formatedQueries.categories = { $in: wishListCategoryIds };

      // Tạo query command
      let queryCommand = Product.find(formatedQueries)
        .sort({ soldCount: -1, averageRating: -1 }) // Sắp xếp theo số lượng bán và điểm đánh giá
        .populate("author categories publisher");

      // Sắp xếp theo trường khác nếu có
      if (queries.sort) {
        const sortBy = queries.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Giới hạn các field trả về
      if (queries.fields) {
        const fields = queries.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      // Pagination
      const page = +queries.page || 1;
      const limit = +queries.limit || 10;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      // Lấy danh sách sản phẩm phổ biến
      const popularProducts = await queryCommand.exec();

      // Lấy tổng số lượng sản phẩm
      const counts = await Product.find(formatedQueries).countDocuments();

      return {
        success: popularProducts.length > 0,
        counts,
        popularProducts: popularProducts.length > 0 ? popularProducts : [],
      };
    } catch (error) {
      throw error;
    }
  }

  async createProduct(productData) {
    try {
      // Kiểm tra điều kiện costPrice < price
      if (productData.costPrice >= productData.price) {
        throw new Error("Cost price must be smaller than the selling price.");
      }

      // Tạo và lưu sản phẩm mới
      const product = new Product(productData);
      return await product.save();
    } catch (error) {
      throw error;
    }
  }

  async checkDocumentById(model, id) {
    const document = await model.findById(id);
    if (!document) {
      return { exists: false, message: "Document not found" };
    }
    return { exists: true, document };
  }

  async updateProduct(id, updateData, file) {
    try {
      const existingProduct = await Product.findById(id);

      if (!existingProduct) {
        throw new Error("Product not found");
      }

      // Kiểm tra costPrice < price nếu có cập nhật
      if (
        updateData.costPrice &&
        updateData.price &&
        updateData.costPrice >= updateData.price
      ) {
        throw new Error("Cost price must be smaller than the selling price.");
      }

      // Xử lý xóa ảnh cũ nếu có ảnh mới được upload
      if (file) {
        if (existingProduct.image) {
          const publicId = existingProduct.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`bookstore/${publicId}`);
        }
        updateData.image = file.path; // Lưu URL của ảnh mới
      }

      // Cập nhật sản phẩm
      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
      })
        .populate("categories")
        .populate("author")
        .populate("publisher");

      return updatedProduct;
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      // Kiểm tra sự tồn tại của Product
      const check = await this.checkDocumentById(Product, id);
      if (!check.exists) {
        throw new Error(check.message);
      }

      // Xóa liên kết LineItems
      await LineItem.updateMany({ product: id }, { product: null });

      // Xóa mềm Product
      await Product.delete({ _id: id });

      return { success: true, message: "Delete successful, LineItems updated" };
    } catch (error) {
      throw error;
    }
  }

  async forceDeleteProduct(id) {
    try {
      // Xóa liên kết LineItems
      await LineItem.updateMany({ product: id }, { product: null });

      // Xóa vĩnh viễn Product
      await Product.deleteOne({ _id: id });

      return {
        success: true,
        message: "Force delete successful, LineItems updated",
      };
    } catch (error) {
      throw error;
    }
  }

  async restoreProduct(id) {
    try {
      // Khôi phục sản phẩm (restore)
      await Product.restore({ _id: id });

      // Lấy thông tin sản phẩm đã khôi phục
      const restoredProduct = await Product.findById(id);
      if (!restoredProduct) {
        throw new Error("Product not found");
      }

      return restoredProduct;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProductService();
