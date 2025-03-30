// recommendationService.js
const { calculateSimilarity } = require("../../util/similarityUtils");
const Product = require("../models/Product");

/**
 * Hàm collaborativeFiltering: tính toán điểm tương đồng giữa các sản phẩm trong wishlist và các sản phẩm khác
 * Sau đó, sắp xếp và trả về top 10 sản phẩm có điểm tương đồng cao nhất.
 *
 * @param {String} userId - ID của người dùng
 * @param {Array} listProductIds - Mảng chứa các ID sản phẩm trong wishlist của người dùng
 * @returns {Array} Mảng chứa các ID sản phẩm đề xuất (top 10)
 */
// async function collaborativeFiltering(userId, listProductIds) {
//   try {
//     // Lấy tất cả sản phẩm với populate các trường cần thiết
//     const allProducts = await Product.find()
//       .populate("categories")
//       .populate("author")
//       .populate("publisher");

//     const productSimilarityScores = {};

//     // Lặp qua từng sản phẩm trong wishlist của người dùng
//     for (const productId of listProductIds) {
//       // Lấy thông tin sản phẩm với các trường liên quan
//       const product = await Product.findById(productId)
//         .populate("categories")
//         .populate("author")
//         .populate("publisher");

//       // So sánh với tất cả các sản phẩm khác
//       for (const otherProduct of allProducts) {
//         if (productId !== otherProduct._id.toString()) {
//           const simScore = calculateSimilarity(product, otherProduct);
//           if (!productSimilarityScores[otherProduct._id]) {
//             productSimilarityScores[otherProduct._id] = 0;
//           }
//           productSimilarityScores[otherProduct._id] += simScore;
//         }
//       }
//     }

//     // Sắp xếp các sản phẩm theo điểm tương đồng giảm dần
//     const sortedProductIds = Object.keys(productSimilarityScores).sort(
//       (a, b) => productSimilarityScores[b] - productSimilarityScores[a]
//     );

//     // Trả về top 10 sản phẩm
//     return sortedProductIds.slice(0, 10);
//   } catch (error) {
//     throw error;
//   }
// }

async function collaborativeFiltering(
  userId,
  userProductIds,
  purchasedProductIds,
  wishListProductIds
) {
  try {
    // Lấy tất cả sản phẩm chưa mua và chưa trong wishlist
    const allProducts = await Product.find({ _id: { $nin: userProductIds } })
      .populate("categories")
      .populate("author")
      .populate("publisher")
      .lean();

    if (!allProducts.length) return [];

    // Lấy sản phẩm đã mua và trong wishlist để so sánh
    const userProducts = await Product.find({ _id: { $in: userProductIds } })
      .populate("categories")
      .populate("author")
      .populate("publisher")
      .lean();

    const productSimilarityScores = {};

    // Trọng số: purchased (2), wishlist (1)
    const PURCHASED_WEIGHT = 2;
    const WISHLIST_WEIGHT = 1;

    // Tính điểm tương đồng
    for (const product of userProducts) {
      const weight = purchasedProductIds.has(product._id.toString())
        ? PURCHASED_WEIGHT
        : WISHLIST_WEIGHT;

      for (const otherProduct of allProducts) {
        const simScore = await calculateSimilarity(product, otherProduct);
        productSimilarityScores[otherProduct._id] =
          (productSimilarityScores[otherProduct._id] || 0) + simScore * weight;
      }
    }

    // Sắp xếp và lấy top 10
    const sortedProductIds = Object.keys(productSimilarityScores)
      .sort((a, b) => productSimilarityScores[b] - productSimilarityScores[a])
      .slice(0, 10);

    return sortedProductIds;
  } catch (error) {
    throw new Error(`Error in collaborativeFiltering: ${error.message}`);
  }
}

module.exports = { collaborativeFiltering };
