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
