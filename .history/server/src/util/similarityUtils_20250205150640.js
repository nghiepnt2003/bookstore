const cosineSimilarity = require("cosine-similarity");

/**
 * Chuyển đổi danh sách categories của sản phẩm thành vector one-hot
 * @param {Object} product - Document của sản phẩm, có thuộc tính categories (mảng các đối tượng có _id)
 * @param {Array} categoryList - Mảng chứa các ID của thể loại (dạng chuỗi) dùng làm danh mục chuẩn
 * @returns {Array} - Vector one-hot tương ứng
 */
function createCategoryVector(product, categoryList) {
  return categoryList.map((catId) =>
    product.categories.some((cat) => cat._id.toString() === catId) ? 1 : 0
  );
}

/**
 * Tính điểm tương đồng giữa 2 sản phẩm dựa trên:
 *   - Tác giả (nếu giống nhau, cộng 1 điểm)
 *   - Thể loại: sử dụng one-hot encoding và cosine similarity
 *   - Giá bán: sử dụng cosine similarity trên vector [price]
 *
 * @param {Object} productA
 * @param {Object} productB
 * @param {Array} [allCategoryIds] - (Tùy chọn) Nếu truyền vào, dùng danh sách này để tạo vector; nếu không, dùng hợp của các thể loại của 2 sản phẩm.
 * @returns {Number} Điểm tương đồng
 */
function calculateSimilarity(productA, productB, allCategoryIds) {
  let similarityScore = 0;

  // So sánh tác giả: nếu cùng thì cộng 1
  if (productA.author.toString() === productB.author.toString()) {
    similarityScore += 1;
  }

  // Tính toán vector cho categories
  const unionCategories =
    allCategoryIds ||
    Array.from(
      new Set([
        ...productA.categories.map((cat) => cat._id.toString()),
        ...productB.categories.map((cat) => cat._id.toString()),
      ])
    );

  const vectorA = createCategoryVector(productA, unionCategories);
  const vectorB = createCategoryVector(productB, unionCategories);

  // Tính cosine similarity giữa vector categories
  const categoryCosine = cosineSimilarity(vectorA, vectorB);
  similarityScore += categoryCosine;

  // So sánh giá bán: vì giá là một số nên chuyển thành vector [price]
  const priceSimilarity = cosineSimilarity([productA.price], [productB.price]);
  similarityScore += priceSimilarity;

  return similarityScore;
}

module.exports = { calculateSimilarity };
