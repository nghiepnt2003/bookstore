import React, { useState } from "react";
import axios from "axios";
import ConfirmQRCodeScan from "./ConfirmQRCodeScan";

function Checkout({ orderId }) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const handleCheckout = async () => {
    try {
      const response = await axios.post(`/order/checkout`);
      if (response.data.success) {
        setQrCodeUrl(response.data.qrCode);
      } else {
        alert(`Failed to generate QR Code: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      alert("Failed to generate QR code.");
    }
  };

  return (
    <div>
      <button onClick={handleCheckout}>Checkout</button>
      {qrCodeUrl && (
        <ConfirmQRCodeScan orderId={orderId} qrCodeUrl={qrCodeUrl} />
      )}
    </div>
  );
}

export default Checkout;
