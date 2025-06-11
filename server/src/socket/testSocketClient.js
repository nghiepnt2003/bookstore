// const io = require("socket.io-client");

// // Thay đổi URL dưới đây cho phù hợp với server của bạn
// const socket = io("http://localhost:3000");

// socket.on("connect", () => {
//   console.log("Connected to the server"); // Thông báo khi kết nối thành công
//   socket.emit("joinRoom", 2); // join vào room để gửi tin nhắn chỉ đến người đó (room phòng = ID người mua)

//   // Gửi một tin nhắn thử nghiệm
//   socket.emit("sendMessage", {
//     sender: 2,
//     receiver: 1,
//     content: "Hello Admin, my product have problem !!!",
//   });
// });

// socket.on("receiveMessage", (message) => {
//   console.log("New message received:", message);
// });

// socket.on("disconnect", () => {
//   console.log("Disconnected from the server"); // Thông báo khi ngắt kết nối
// });

const io = require("socket.io-client");

// Kết nối tới server
const socket = io("http://localhost:3000");

const sender = 2; // ID của User 2
const receiver = 1; // ID của Admin

socket.on("connect", () => {
  console.log("Connected to the server");

  // Tham gia vào cuộc trò chuyện với Admin
  socket.emit("joinConversation", { user1: sender, user2: receiver });

  // Gửi một tin nhắn
  socket.emit("sendMessage", {
    sender,
    receiver,
    content: "Hello Admin, my product has a problem!!!",
  });
});

socket.on("receiveMessage", (message) => {
  console.log("New message received:", message);
});

socket.on("disconnect", () => {
  console.log("Disconnected from the server");
});
