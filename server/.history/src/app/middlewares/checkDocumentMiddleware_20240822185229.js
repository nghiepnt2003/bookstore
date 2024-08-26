async function checkDocumentExistence(Model, id, name) {
  // Kiểm tra sự tồn tại của tài liệu với id
  // const document = await Model.findById(id);
  const document = await Model.findOne({ _id: id });
  if (!document) {
    return { exists: false, message: "Document with this ID does not exist" };
  }

  // Kiểm tra sự tồn tại của tài liệu với name
  const existingDocument = await Model.findOne({ name });
  if (existingDocument && existingDocument._id.toString() !== id) {
    return { exists: false, message: "Document with this name already exists" };
  }

  // Nếu không có vấn đề gì, trả về tài liệu
  return { exists: true, document };
}
async function checkDocumentById(Model, id) {
  // Kiểm tra sự tồn tại của tài liệu với id
  // const document = await Model.findById(id);
  const document = await Model.findOne({ _id: id });
  if (!document) {
    return { exists: false, message: "Document with this ID does not exist" };
  }
  // Nếu không có vấn đề gì, trả về tài liệu
  return { exists: true, document };
}
async function checkDocumentExistName(Model, id, name) {
  const document = await Model.findOne({ _id: id });

  // Kiểm tra sự tồn tại của tài liệu với name
  const existingDocument = await Model.findOne({ name });
  if (existingDocument && existingDocument._id.toString() !== id) {
    return { exists: false, message: "Document with this name already exists" };
  }
  // Nếu không có vấn đề gì, trả về tài liệu
  return { exists: true, document };
}
module.exports = {
  checkDocumentExistence,
  checkDocumentById,
  checkDocumentExistName,
};
