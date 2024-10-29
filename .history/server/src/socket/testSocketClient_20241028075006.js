const io = require("socket.io-client");

// Thay đổi URL dưới đây cho phù hợp với server của bạn
const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to the server"); // Thông báo khi kết nối thành công
  // Gửi một tin nhắn thử nghiệm
  socket.emit("sendMessage", {
    sender: 27,
    receiver: 7,
    content: "Hello from test client!",
  });
});

socket.on("receiveMessage", (message) => {
  console.log("New message received:", message);
});

socket.on("disconnect", () => {
  console.log("Disconnected from the server"); // Thông báo khi ngắt kết nối
});
