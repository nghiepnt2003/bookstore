module.exports = async function checkPurchaseProduct(Model, id, name) {
  const document = await Model.findOne({ _id: id });

  // Kiểm tra sự tồn tại của tài liệu với name
  const existingDocument = await Model.findOne({ name });
  if (existingDocument && existingDocument._id.toString() !== id) {
    return { exists: false, message: "Document with this name already exists" };
  }
  // Nếu không có vấn đề gì, trả về tài liệu
  return { exists: true, document };
};
