// const cosineSimilarity = require("cosine-similarity");

// /**
//  * Chuyển danh sách thể loại của sản phẩm thành vector one-hot
//  */
// function createCategoryVector(product, categoryList) {
//   return categoryList.map((catId) =>
//     product.categories.some((cat) => cat._id.toString() === catId) ? 1 : 0
//   );
// }

// /**
//  * Tính điểm tương đồng giữa 2 sản phẩm theo thứ tự ưu tiên:
//  * 1️⃣ Nhiều thể loại trùng khớp (cao nhất)
//  * 2️⃣ Cùng tác giả (cao nhưng thấp hơn thể loại)
//  * 3️⃣ Giá gần nhau (ảnh hưởng ít nhất)
//  */
// function calculateSimilarity(productA, productB, allCategoryIds) {
//   let similarityScore = 0;

//   // 1️⃣ 🔥 Ưu tiên thể loại trùng khớp cao nhất (tăng trọng số lên 5)
//   const unionCategories =
//     allCategoryIds ||
//     Array.from(
//       new Set([
//         ...productA.categories.map((cat) => cat._id.toString()),
//         ...productB.categories.map((cat) => cat._id.toString()),
//       ])
//     );

//   const categoryVectorA = createCategoryVector(productA, unionCategories);
//   const categoryVectorB = createCategoryVector(productB, unionCategories);

//   const categorySimilarity = cosineSimilarity(categoryVectorA, categoryVectorB);
//   similarityScore += categorySimilarity * 5; // Hệ số 5 để ưu tiên cao hơn nữa

//   // 2️⃣ 🔥 Ưu tiên sản phẩm có cùng tác giả (giữ ở mức 2)
//   if (productA.author.toString() === productB.author.toString()) {
//     similarityScore += 2;
//   }

//   // 3️⃣ 🔥 So sánh giá bán (cosine similarity, giảm hệ số xuống 0.5)
//   const priceSimilarity = cosineSimilarity([productA.price], [productB.price]);
//   similarityScore += priceSimilarity * 0.5; // Ảnh hưởng ít hơn

//   return similarityScore;
// }

// module.exports = { calculateSimilarity };

const cosineSimilarity = require("cosine-similarity");

let minPrice = 0;
let maxPrice = 0;
async function updatePriceRange() {
  const priceStats = await Product.aggregate([
    { $match: { deleted: false } },
    {
      $group: {
        _id: null,
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
  ]);
  if (priceStats.length > 0) {
    minPrice = priceStats[0].minPrice || 0;
    maxPrice = priceStats[0].maxPrice || 1000;
  }
}

// Cập nhật khi server khởi động
updatePriceRange();

function createCategoryVector(product, categoryList) {
  return categoryList.map((catId) =>
    product.categories.some((cat) => cat._id.toString() === catId.toString())
      ? 1
      : 0
  );
}

async function calculateSimilarity(productA, productB) {
  let similarityScore = 0;

  // Lấy danh sách thể loại toàn cục
  const allCategories = await Product.distinct("categories");
  const unionCategories = Array.from(
    new Set(allCategories.map((cat) => cat.toString()))
  );

  // 1. Tương đồng thể loại (trọng số 5)
  const categoryVectorA = createCategoryVector(productA, unionCategories);
  const categoryVectorB = createCategoryVector(productB, unionCategories);
  const categorySimilarity = cosineSimilarity(categoryVectorA, categoryVectorB);
  similarityScore += categorySimilarity * 5;

  // 2. Tương đồng tác giả (trọng số 2)
  const authorA = Array.isArray(productA.author)
    ? productA.author.map((a) => a._id.toString())
    : [productA.author?._id?.toString()];
  const authorB = Array.isArray(productB.author)
    ? productB.author.map((a) => a._id.toString())
    : [productB.author?._id?.toString()];
  const hasSameAuthor = authorA.some((a) => authorB.includes(a));
  if (hasSameAuthor) similarityScore += 2;

  // 3. Tương đồng giá (trọng số 0.5)
  const normalizedPriceA = (productA.price - minPrice) / (maxPrice - minPrice);
  const normalizedPriceB = (productB.price - minPrice) / (maxPrice - minPrice);
  const priceSimilarity = 1 - Math.abs(normalizedPriceA - normalizedPriceB);
  similarityScore += priceSimilarity * 0.5;

  return similarityScore;
}

module.exports = {
  suggestProducts,
  collaborativeFiltering,
  calculateSimilarity,
};
