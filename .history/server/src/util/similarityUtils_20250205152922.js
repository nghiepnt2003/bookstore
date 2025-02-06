// const cosineSimilarity = require("cosine-similarity");

// /**
//  * Chuyển đổi danh sách categories của sản phẩm thành vector one-hot
//  * @param {Object} product - Document của sản phẩm, có thuộc tính categories (mảng các đối tượng có _id)
//  * @param {Array} categoryList - Mảng chứa các ID của thể loại (dạng chuỗi) dùng làm danh mục chuẩn
//  * @returns {Array} - Vector one-hot tương ứng
//  */
// function createCategoryVector(product, categoryList) {
//   return categoryList.map((catId) =>
//     product.categories.some((cat) => cat._id.toString() === catId) ? 1 : 0
//   );
// }

// /**
//  * Tính điểm tương đồng giữa 2 sản phẩm dựa trên:
//  *   - Tác giả (nếu giống nhau, cộng 1 điểm)
//  *   - Thể loại: sử dụng one-hot encoding và cosine similarity
//  *   - Giá bán: sử dụng cosine similarity trên vector [price]
//  *
//  * @param {Object} productA
//  * @param {Object} productB
//  * @param {Array} [allCategoryIds] - (Tùy chọn) Nếu truyền vào, dùng danh sách này để tạo vector; nếu không, dùng hợp của các thể loại của 2 sản phẩm.
//  * @returns {Number} Điểm tương đồng
//  */
// function calculateSimilarity(productA, productB, allCategoryIds) {
//   let similarityScore = 0;

//   // So sánh tác giả: nếu cùng thì cộng 1
//   if (productA.author.toString() === productB.author.toString()) {
//     similarityScore += 1;
//   }

//   // Tính toán vector cho categories
//   const unionCategories =
//     allCategoryIds ||
//     Array.from(
//       new Set([
//         ...productA.categories.map((cat) => cat._id.toString()),
//         ...productB.categories.map((cat) => cat._id.toString()),
//       ])
//     );

//   const vectorA = createCategoryVector(productA, unionCategories);
//   const vectorB = createCategoryVector(productB, unionCategories);

//   // Tính cosine similarity giữa vector categories
//   const categoryCosine = cosineSimilarity(vectorA, vectorB);
//   similarityScore += categoryCosine;

//   // So sánh giá bán: vì giá là một số nên chuyển thành vector [price]
//   const priceSimilarity = cosineSimilarity([productA.price], [productB.price]);
//   similarityScore += priceSimilarity;

//   return similarityScore;
// }

// module.exports = { calculateSimilarity };

const Product = require("../models/Product");
const User = require("../models/User");
const { collaborativeFiltering } = require("./recommendationService");

/**
 * API Gợi ý sản phẩm với thứ tự ưu tiên:
 * 1️⃣ Thể loại trùng khớp (quan trọng nhất)
 * 2️⃣ Cùng tác giả (quan trọng thứ hai)
 * 3️⃣ Giá bán gần nhau (ít quan trọng nhất)
 */
async function suggestProducts(userId, queries) {
  try {
    const user = await User.findById(userId).populate("wishList");
    const wishListProductIds = user.wishList.map((product) => product._id);

    // 🔥 Gợi ý sản phẩm từ AI Collaborative Filtering
    const recommendedProductIds = await collaborativeFiltering(
      userId,
      wishListProductIds
    );

    // 🔥 Lọc sản phẩm theo query
    const queryCopy = { ...queries };
    const excludeFields = ["limit", "sort", "page", "fields"];
    excludeFields.forEach((el) => delete queryCopy[el]);

    let queryString = JSON.stringify(queryCopy);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (matched) => `$${matched}`
    );
    const formattedQueries = JSON.parse(queryString);

    // 🔥 Nếu query có lọc theo thể loại hoặc tác giả, áp dụng thêm bộ lọc
    formattedQueries.categories = {
      $in: user.wishList.flatMap((product) => product.categories),
    };

    formattedQueries._id = { $nin: wishListProductIds };

    let queryCommand = Product.find(formattedQueries)
      .populate("categories")
      .populate("author")
      .populate("publisher");

    // 🔥 Kết hợp sản phẩm từ AI Collaborative Filtering vào danh sách
    queryCommand = queryCommand.or([
      { _id: { $in: recommendedProductIds } },
      formattedQueries,
    ]);

    // 🔥 Sắp xếp theo tiêu chí nếu có
    if (queries.sort) {
      const sortBy = queries.sort.split(",").join(" ");
      queryCommand = queryCommand.sort(sortBy);
    }

    // 🔥 Giới hạn số lượng sản phẩm trả về
    const page = +queries.page || 1;
    const limit = +queries.limit || process.env.LIMIT_PRODUCTS;
    const skip = (page - 1) * limit;
    queryCommand.skip(skip).limit(limit);

    // 🔥 Trả về danh sách sản phẩm gợi ý
    const suggestedProducts = await queryCommand.exec();
    const counts = await Product.find(formattedQueries).countDocuments();

    return {
      success: suggestedProducts.length > 0,
      counts,
      suggestedProducts: suggestedProducts.length > 0 ? suggestedProducts : [],
    };
  } catch (error) {
    throw error;
  }
}

module.exports = { suggestProducts };
