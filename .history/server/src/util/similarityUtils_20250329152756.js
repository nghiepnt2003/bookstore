const cosineSimilarity = require("cosine-similarity");

/**
 * Chuyển danh sách thể loại của sản phẩm thành vector one-hot
 */
function createCategoryVector(product, categoryList) {
  if (!product || !Array.isArray(product.categories))
    return Array(categoryList.length).fill(0);
  return categoryList.map((catId) =>
    product.categories.some((cat) => cat._id?.toString() === catId) ? 1 : 0
  );
}

/**
 * Tính điểm tương đồng giữa 2 sản phẩm
 */
function calculateSimilarity(productA, productB, allCategoryIds) {
  if (!productA || !productB) return 0; // Trả về 0 nếu thiếu dữ liệu

  let similarityScore = 0;

  // 1️⃣ 🔥 Ưu tiên thể loại trùng khớp cao nhất
  const unionCategories =
    allCategoryIds ||
    Array.from(
      new Set([
        ...(productA.categories?.map((cat) => cat._id?.toString()) || []),
        ...(productB.categories?.map((cat) => cat._id?.toString()) || []),
      ])
    );

  const categoryVectorA = createCategoryVector(productA, unionCategories);
  const categoryVectorB = createCategoryVector(productB, unionCategories);
  similarityScore += cosineSimilarity(categoryVectorA, categoryVectorB) * 5;

  // 2️⃣ 🔥 Ưu tiên sản phẩm có cùng tác giả
  if (productA.author?.toString() === productB.author?.toString()) {
    similarityScore += 2;
  }

  // 3️⃣ 🔥 So sánh giá bán
  const priceA = parseFloat(productA.price) || 0;
  const priceB = parseFloat(productB.price) || 0;

  if (priceA > 0 && priceB > 0) {
    const maxPrice = Math.max(priceA, priceB);
    const priceDifference = Math.abs(priceA - priceB) / maxPrice; // Tính chênh lệch giá
    similarityScore += (1 - priceDifference) * 0.5; // Giá càng gần, điểm càng cao
  }

  return similarityScore;
}

module.exports = { calculateSimilarity };
