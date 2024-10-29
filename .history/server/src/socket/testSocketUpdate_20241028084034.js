const io = require("socket.io-client");

// Thay đổi URL dưới đây cho phù hợp với server của bạn
const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to the server"); // Thông báo khi kết nối thành công
  socket.emit("joinRoom", 27); // Gọi tham gia vào phòng

  // Gửi yêu cầu sửa một tin nhắn thử nghiệm
  // Thay thế 'messageIdToUpdate' bằng ID của tin nhắn bạn muốn sửa
  const messageIdToUpdate = "YOUR_MESSAGE_ID_HERE"; // Thay thế ID này bằng ID tin nhắn bạn muốn sửa
  const updatedContent = "Updated message content"; // Nội dung mới cho tin nhắn
  const updatedImage = null; // Thay đổi nếu có ảnh

  socket.emit("updateMessage", {
    messageId: messageIdToUpdate,
    content: updatedContent,
    image: updatedImage,
  });
});

// Lắng nghe sự kiện nhận tin nhắn đã cập nhật
socket.on("receiveMessage", (updatedMessage) => {
  console.log("Message updated:", updatedMessage);
});

socket.on("disconnect", () => {
  console.log("Disconnected from the server"); // Thông báo khi ngắt kết nối
});
