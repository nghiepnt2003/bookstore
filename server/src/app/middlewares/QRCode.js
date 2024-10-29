const QRCode = require("qrcode");

// Hàm tạo QR code MoMo và trả về base64
function generateMoMoQR(phone, price) {
  // Tạo chuỗi theo định dạng MoMo
  const text = `2|99|${phone}|||||${price}`;

  // Tạo mã QR và trả về dưới dạng URL base64
  QRCode.toDataURL(
    text,
    {
      color: {
        dark: "#000", // Màu của mã QR (đen)
        light: "#FFF", // Màu nền (trắng)
      },
    },
    function (err, url) {
      if (err) throw err;
      console.log("QR code base64:", url);
    }
  );

  // Tạo mã QR và hiển thị dưới dạng ASCII trong console
  QRCode.toString(text, { type: "terminal" }, function (err, string) {
    if (err) throw err;
    console.log("QR code ASCII:");
    console.log(string);
  });
}

// Gọi hàm với các tham số cụ thể
// generateMoMoQR("0834643661", 1000);

// Tạo ra một button "đã thanh toán" để call API chuyển status đơn hàng
