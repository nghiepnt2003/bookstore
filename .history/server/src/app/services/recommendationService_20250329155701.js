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
async function collaborativeFiltering(userId, listProductIds) {
  try {
    // Lấy tất cả sản phẩm cùng một lúc để tránh truy vấn nhiều lần
    const [allProducts, wishlistProducts] = await Promise.all([
      Product.find().populate("categories author publisher"),
      Product.find({ _id: { $in: listProductIds } }).populate(
        "categories author publisher"
      ),
    ]);

    const productSimilarityScores = {};

    for (const product of wishlistProducts) {
      for (const otherProduct of allProducts) {
        if (!listProductIds.includes(otherProduct._id.toString())) {
          const simScore = calculateSimilarity(product, otherProduct);
          productSimilarityScores[otherProduct._id] =
            (productSimilarityScores[otherProduct._id] || 0) + simScore;
        }
      }
    }

    // Sắp xếp theo điểm số và lấy top 10
    return Object.keys(productSimilarityScores)
      .sort((a, b) => productSimilarityScores[b] - productSimilarityScores[a])
      .slice(0, 10);
  } catch (error) {
    throw error;
  }
}

module.exports = { collaborativeFiltering };
