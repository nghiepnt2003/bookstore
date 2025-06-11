const io = require("socket.io-client");

// Thay đổi URL dưới đây cho phù hợp với server của bạn
const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to the server"); // Thông báo khi kết nối thành công
  socket.emit("joinRoom", 27); // Gọi tham gia vào phòng

  // Gửi yêu cầu xóa một tin nhắn thử nghiệm
  // Thay thế 'messageIdToDelete' bằng ID của tin nhắn bạn muốn xóa
  const messageIdToDelete = 12; // Thay thế ID này bằng ID tin nhắn bạn muốn xóa
  socket.emit("deleteMessage", messageIdToDelete);
});

// Lắng nghe sự kiện xóa tin nhắn
socket.on("deleteMessage", (deletedMessage) => {
  console.log("Message deleted:", deletedMessage);
});

socket.on("disconnect", () => {
  console.log("Disconnected from the server"); // Thông báo khi ngắt kết nối
});
