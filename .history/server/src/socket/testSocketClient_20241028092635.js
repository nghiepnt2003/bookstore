// const io = require("socket.io-client");

// // Thay đổi URL dưới đây cho phù hợp với server của bạn
// const socket = io("http://localhost:3000");

// socket.on("connect", () => {
//   console.log("Connected to the server"); // Thông báo khi kết nối thành công
//   socket.emit("joinRoom", 27); // Gọi tham gia vào phòng của người gửi tin nhắn

//   // Gửi một tin nhắn thử nghiệm
//   socket.emit("sendMessage", {
//     sender: 27,
//     receiver: 7,
//     content: "Hello Admin, my product have problem !!!",
//   });
// });

// socket.on("receiveMessage", (message) => {
//   console.log("New message received:", message);
// });

// socket.on("disconnect", () => {
//   console.log("Disconnected from the server"); // Thông báo khi ngắt kết nối
// });
// client.js (hoặc file tương tự)
const axios = require("axios");
const socket = require("socket.io-client")("http://localhost:3000");

async function sendMessage() {
  try {
    const response = await axios.post("http://localhost:3000/messages", {
      receiver: 7, // ID người nhận
      // content: "Hello Admin, my product have problem !!!",
    });

    console.log(response.data); // In ra phản hồi từ server
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

// Gọi hàm gửi tin nhắn
sendMessage();
socket.on("connect", () => {
  console.log("Connected to the server");
  socket.emit("joinRoom", 27); // Tham gia vào phòng của người gửi tin nhắn
});

socket.on("receiveMessage", (message) => {
  console.log("New message received:", message);
});
