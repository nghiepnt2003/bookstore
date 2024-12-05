const Product = require("../models/Product");
const Author = require("../models/Author");
const Category = require("../models/Category");
const Publisher = require("../models/Publisher");
const LineItem = require("../models/LineItem");
const cloudinary = require("cloudinary").v2;
const Cloud = require("../../config/cloud/cloudinary.config");
const User = require("../models/User");
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

      // Filtering
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

      // Lọc theo tên danh mục
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

      // Tạo query command
      let queryCommand = Product.find(formatedQueries)
        .populate("categories")
        .populate("author")
        .populate("publisher");

      // Sắp xếp
      if (queries.sort) {
        const sortBy = queries.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Giới hạn trường trả về
      if (queries.fields) {
        const fields = queries.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      // Phân trang
      const page = +queries.page || 1;
      const limit = +queries.limit || process.env.LIMIT_PRODUCTS;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      // Lấy danh sách sản phẩm
      const response = await queryCommand.exec();

      // Lấy số lượng sản phẩm
      const counts = await Product.find(formatedQueries).countDocuments();

      return { response, counts };
    } catch (error) {
      throw new Error(error.message);
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

  async createProduct(productData, imagePath) {
    try {
      const { name, price, pageNumber, author, publisher, categories } =
        productData;

      // Kiểm tra các trường bắt buộc
      if (
        !name ||
        !price ||
        !pageNumber ||
        !author ||
        !publisher ||
        !categories
      ) {
        throw new Error("Missing inputs");
      }

      // Kiểm tra costPrice < price
      // if (costPrice >= price) {
      //   throw new Error("Cost price must be smaller than the selling price.");
      // }
      // Nếu có ảnh, gán đường dẫn ảnh vào productData
      if (imagePath) {
        productData.image = imagePath;
      }

      // Tạo sản phẩm mới
      const product = new Product(productData);
      const savedProduct = await product.save();

      return savedProduct;
    } catch (error) {
      throw new Error("Error create product: " + error.message);
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
      let newImageUrl = null;

      // Nếu có ảnh mới được upload, lưu URL vào body
      if (file) {
        newImageUrl = file.path; // Lưu URL của ảnh mới
        updateData.image = newImageUrl; // Cập nhật URL ảnh mới vào body
      }
      let updatedProduct = null;
      try {
        updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
          new: true,
        })
          .populate("categories")
          .populate("author")
          .populate("publisher");

        if (existingProduct.image && existingProduct.image !== newImageUrl) {
          const publicId = existingProduct.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`bookstore/${publicId}`);
        }
      } catch (error) {
        if (newImageUrl) {
          const publicId = newImageUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`bookstore/${publicId}`);
        }
        throw new Error(error);
      }
      // Cập nhật sản phẩm

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
