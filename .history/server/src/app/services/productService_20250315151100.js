const cosineSimilarity = require("cosine-similarity"); // Thư viện tính toán Cosine Similarity
const Product = require("../models/Product");
const Author = require("../models/Author");
const Category = require("../models/Category");
const Publisher = require("../models/Publisher");
const LineItem = require("../models/LineItem");
const cloudinary = require("cloudinary").v2;
const Cloud = require("../../config/cloud/cloudinary.config");
const User = require("../models/User");
const { collaborativeFiltering } = require("./recommendationService");
class ProductService {
  async getById(productId) {
    try {
      const product = await Product.findOne({ _id: productId })
        .populate("categories") // Populate thông tin của các category
        .populate("author") // Populate thông tin của author nếu cần
        .populate("publisher"); // Populate thông tin của publisher nếu cần
      const finalPrice = await product.getFinalPrice();
      return { success: !!product, product, finalPrice };
    } catch (error) {
      throw error;
    }
  }
  async getProducts({ filterQueries, limit, sort, page, fields }) {
    try {
      // Format lại các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(filterQueries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      // Filtering
      if (filterQueries?.name) {
        formatedQueries.name = { $regex: filterQueries.name, $options: "i" };
      }

      // Lọc theo tên tác giả
      if (filterQueries.authorName) {
        const authors = await Author.find({
          name: { $regex: filterQueries.authorName, $options: "i" },
        }).select("_id");
        const authorIds = authors.map((author) => author._id);
        if (authorIds.length > 0) {
          formatedQueries.author = { $in: authorIds };
        }
      }

      // Lọc theo tên danh mục
      if (filterQueries.categoryName) {
        const categories = await Category.find({
          name: { $regex: filterQueries.categoryName, $options: "i" },
        }).select("_id");
        const categoryIds = categories.map((category) => category._id);
        if (categoryIds.length > 0) {
          formatedQueries.categories = { $in: categoryIds };
        }
      }

      // Lọc theo nhà xuất bản
      if (filterQueries.publisherName) {
        const publisher = await Publisher.findOne({
          name: { $regex: filterQueries.publisherName, $options: "i" },
        }).select("_id");
        if (publisher) {
          formatedQueries.publisher = publisher._id;
        }
      }

      // Tạo query command
      let queryCommand = Product.find(formatedQueries)
        .populate("categories")
        .populate("author")
        .populate("publisher");

      // Sắp xếp
      if (sort) {
        const sortBy = sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Giới hạn trường trả về
      if (fields) {
        const selectedFields = fields.split(",").join(" ");
        queryCommand = queryCommand.select(selectedFields);
      }

      // Phân trang
      const currentPage = +page || 1;
      const perPage = +limit || process.env.LIMIT_PRODUCTS || 100;
      const skip = (currentPage - 1) * perPage;
      queryCommand.skip(skip).limit(perPage);

      // Lấy danh sách sản phẩm
      const response = await queryCommand.exec();

      // Lấy số lượng sản phẩm
      const counts = await Product.find(formatedQueries).countDocuments();

      return { response, counts };
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async getProductsWithDiscount(queries) {
    const queryCopy = { ...queries };
    const excludeFields = ["limit", "sort", "page", "fields"];
    excludeFields.forEach((el) => delete queryCopy[el]);

    let queryString = JSON.stringify(queryCopy);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (matchedEl) => `$${matchedEl}`
    );
    const formatedQueries = JSON.parse(queryString);

    formatedQueries.discount = { $ne: null };

    let queryCommand = Product.find(formatedQueries)
      .populate({
        path: "discount",
        match: {
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() },
        },
        select: "discountPercentage startDate endDate",
      })
      .populate({
        path: "author",
        select: "name",
      })
      .populate({
        path: "publisher",
        select: "name",
      });

    if (queries.sort) {
      const sortBy = queries.sort.split(",").join(" ");
      queryCommand = queryCommand.sort(sortBy);
    }

    if (queries.fields) {
      const fields = queries.fields.split(",").join(" ");
      queryCommand = queryCommand.select(fields);
    }

    const page = +queries.page || 1;
    const limit = +queries.limit || process.env.LIMIT_PRODUCTS || 10;
    const skip = (page - 1) * limit;
    queryCommand.skip(skip).limit(limit);

    const products = await queryCommand.exec();

    // Tính finalPrice cho từng sản phẩm
    const productsWithFinalPrice = async products.map((product) => {
      // let finalPrice = product.price;
      // if (product.discount) {
      //   finalPrice =
      //     product.price * (1 - product.discount.discountPercentage / 100);
      // }
      let finalPrice = await product.getFinalPrice();
      return {
        ...product.toObject(),
        finalPrice: parseFloat(finalPrice.toFixed(2)), // Thêm finalPrice vào kết quả trả về
      };
    });

    const counts = await Product.find({
      ...formatedQueries,
      discount: { $ne: null },
    }).countDocuments();

    return { products: productsWithFinalPrice, counts };
  }

  async suggestProducts(userId, queries) {
    try {
      // Lấy thông tin người dùng và wishlist
      const user = await User.findById(userId).populate("wishList");
      const wishListProductIds = user.wishList.map((product) => product._id);

      // Lấy danh sách sản phẩm đề xuất từ Collaborative Filtering
      const recommendedProductIds = await collaborativeFiltering(
        userId,
        wishListProductIds
      );

      // Xây dựng bộ lọc theo query
      const queryCopy = { ...queries };
      const excludeFields = ["limit", "sort", "page", "fields"];
      excludeFields.forEach((el) => delete queryCopy[el]);

      let queryString = JSON.stringify(queryCopy);
      // Định dạng các operator: gte, gt, lt, lte
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matched) => `$${matched}`
      );
      const formattedQueries = JSON.parse(queryString);

      // Filtering theo tên sản phẩm nếu có
      if (queries?.name) {
        formattedQueries.name = { $regex: queries.name, $options: "i" };
      }

      // Lọc thêm theo các trường khác nếu cần (ví dụ tác giả, ...)

      // Thêm điều kiện lọc theo danh mục của các sản phẩm trong wishlist (nếu cần)
      formattedQueries.categories = {
        $in: user.wishList.flatMap((product) => product.categories),
      };

      // Loại bỏ các sản phẩm đã có trong wishlist
      formattedQueries._id = { $nin: wishListProductIds };

      // Tạo câu lệnh truy vấn
      let queryCommand = Product.find(formattedQueries)
        .populate("categories")
        .populate("author")
        .populate("publisher");

      // Kết hợp kết quả từ Collaborative Filtering và các bộ lọc khác
      queryCommand = queryCommand.or([
        { _id: { $in: recommendedProductIds } },
        formattedQueries,
      ]);

      // Sắp xếp nếu có chỉ định
      if (queries.sort) {
        const sortBy = queries.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Giới hạn các trường trả về nếu có
      if (queries.fields) {
        const fields = queries.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      // Phân trang
      const page = +queries.page || 1;
      const limit = +queries.limit || process.env.LIMIT_PRODUCTS;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      // Thực thi truy vấn
      const suggestedProducts = await queryCommand.exec();
      const counts = await Product.find(formattedQueries).countDocuments();

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
      const wishListCategoryIds =
        user?.wishList?.length > 0
          ? user.wishList.flatMap((product) => product.categories)
          : [];
      const queryCopy = { ...queries };
      // Tách các trường đặc biệt ra khỏi query
      const excludeFields = ["limit", "sort", "page", "fields"];
      excludeFields.forEach((el) => delete queryCopy[el]);

      // Format lại các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(queryCopy);
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
      if (wishListCategoryIds.length > 0) {
        formatedQueries.categories = { $in: wishListCategoryIds };
      }

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

// async function calculateSimilarity(productA, productB) {
//   let similarityScore = 0;

//   // So sánh tác giả
//   if (productA.author.toString() === productB.author.toString()) {
//     similarityScore += 1; // Tăng điểm tương đồng nếu cùng tác giả
//   }

//   // So sánh thể loại (categories)
//   const categoryIntersection = productA.categories.filter((categoryA) =>
//     productB.categories.some(
//       (categoryB) => categoryB._id.toString() === categoryA._id.toString()
//     )
//   ).length;

//   const categoryUnion = new Set([
//     ...productA.categories.map((category) => category._id.toString()),
//     ...productB.categories.map((category) => category._id.toString()),
//   ]).size;

//   const categorySimilarity = categoryIntersection / categoryUnion;
//   similarityScore += categorySimilarity; // Cộng vào điểm tương đồng

//   // So sánh giá bán (price) - tính Cosine Similarity
//   const priceSimilarity = cosineSimilarity([productA.price], [productB.price]);
//   similarityScore += priceSimilarity; // Cộng vào điểm tương đồng

//   return similarityScore;
// }
// async function collaborativeFiltering(userId, wishListProductIds) {
//   try {
//     // Lấy thông tin tất cả các sản phẩm trong cơ sở dữ liệu
//     const allProducts = await Product.find()
//       .populate("categories")
//       .populate("author")
//       .populate("publisher");

//     // Xây dựng một đối tượng chứa sự tương đồng giữa các sản phẩm
//     const productSimilarityScores = {};

//     // Lặp qua tất cả sản phẩm trong wishlist của người dùng
//     for (const productId of wishListProductIds) {
//       const product = await Product.findById(productId)
//         .populate("categories")
//         .populate("author")
//         .populate("publisher");

//       // Lặp qua tất cả các sản phẩm khác trong cơ sở dữ liệu để tính toán sự tương đồng
//       for (const otherProduct of allProducts) {
//         if (productId !== otherProduct._id.toString()) {
//           const similarityScore = calculateSimilarity(product, otherProduct);
//           if (!productSimilarityScores[otherProduct._id]) {
//             productSimilarityScores[otherProduct._id] = 0;
//           }
//           productSimilarityScores[otherProduct._id] += similarityScore;
//         }
//       }
//     }

//     // Sắp xếp các sản phẩm theo điểm tương đồng giảm dần
//     const sortedProductIds = Object.keys(productSimilarityScores).sort(
//       (a, b) => productSimilarityScores[b] - productSimilarityScores[a]
//     );

//     // Lấy các sản phẩm đề xuất
//     const recommendedProductIds = sortedProductIds.slice(0, 10); // Lấy 10 sản phẩm có điểm tương đồng cao nhất

//     return recommendedProductIds;
//   } catch (error) {
//     throw error;
//   }
// }

module.exports = new ProductService();
