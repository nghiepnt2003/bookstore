const io = require("socket.io-client");

// Thay đổi URL dưới đây cho phù hợp với server của bạn
const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to the server"); // Thông báo khi kết nối thành công
  // Gửi một tin nhắn thử nghiệm
  socket.emit("sendMessage", {
    sender:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjI3LCJyb2xlIjoyLCJpYXQiOjE3MzAwNzU1ODEsImV4cCI6MTczMDI0ODM4MX0.TJr4iWeVI-Y3zlgVFrdV-CtjI8z61BAXizhjLTwsF4XoJsuaj1LxsPWEcOGdQsNBFhVWerpO20yKBqXh7xRyfHolWlAaHU0yg_zBtnUdNrbmmHxqt1tmwWAT9I4HrJ63W62WrK4w4KpUcWpOTm0hlCXl8GatrsNz4iAgMfJ5PQ__qfjdWrHn-QFxBu3gSrsTylSAwlm-8tpY68-fI2E5V0SmONdZPulCwics2ZqzTQd3CORG5aYDQAq3dbuOrgJpd4lZvAKwn_LvRIBc9qgwf9u8-zVEBv_1ZwrGiFqhNbWl2Zo81SC3lXEv364L20Jj13np9AZjj36vPXnOkj2Iow",
    receiver: 27,
    content: "Hello from test client!",
  });
});

socket.on("receiveMessage", (message) => {
  console.log("New message received:", message);
});

socket.on("disconnect", () => {
  console.log("Disconnected from the server"); // Thông báo khi ngắt kết nối
});
