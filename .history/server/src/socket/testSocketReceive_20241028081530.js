const io = require("socket.io-client");

// Client receiver
const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Receiver connected to the server");
  socket.emit("joinRoom", 7); // ID của receiver

  // Lắng nghe tin nhắn mới
  socket.on("receiveMessage", (message) => {
    console.log("New message received:", message);
  });
});

socket.on("disconnect", () => {
  console.log("Receiver disconnected from the server");
});
