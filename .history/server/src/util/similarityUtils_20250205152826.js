const cosineSimilarity = require("cosine-similarity");

/**
 * Chuyển danh sách thể loại của sản phẩm thành vector one-hot
 */
function createCategoryVector(product, categoryList) {
  return categoryList.map((catId) =>
    product.categories.some((cat) => cat._id.toString() === catId) ? 1 : 0
  );
}

/**
 * Tính điểm tương đồng giữa 2 sản phẩm theo thứ tự ưu tiên:
 * 1️⃣ Nhiều thể loại trùng khớp → cao nhất
 * 2️⃣ Cùng tác giả → mức trung bình
 * 3️⃣ Giá bán gần nhau → ảnh hưởng thấp
 */
function calculateSimilarity(productA, productB, allCategoryIds) {
  let similarityScore = 0;

  // 1️⃣ 🔥 Ưu tiên thể loại trùng khớp cao nhất
  const unionCategories =
    allCategoryIds ||
    Array.from(
      new Set([
        ...productA.categories.map((cat) => cat._id.toString()),
        ...productB.categories.map((cat) => cat._id.toString()),
      ])
    );

  const categoryVectorA = createCategoryVector(productA, unionCategories);
  const categoryVectorB = createCategoryVector(productB, unionCategories);

  const categorySimilarity = cosineSimilarity(categoryVectorA, categoryVectorB);
  similarityScore += categorySimilarity * 3; // Hệ số 3 để ưu tiên cao nhất

  // 2️⃣ 🔥 Ưu tiên sản phẩm có cùng tác giả
  if (productA.author.toString() === productB.author.toString()) {
    similarityScore += 2; // Hệ số 2 để ưu tiên trung bình
  }

  // 3️⃣ 🔥 So sánh giá bán (cosine similarity)
  const priceSimilarity = cosineSimilarity([productA.price], [productB.price]);
  similarityScore += priceSimilarity * 1; // Hệ số 1 để ảnh hưởng thấp nhất

  return similarityScore;
}

module.exports = { calculateSimilarity };
