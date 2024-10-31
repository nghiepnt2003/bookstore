import React, { useEffect, useState } from "react";
import axios from "axios";

function ConfirmQRCodeScan({ orderId, qrCodeUrl }) {
  const [isScanned, setIsScanned] = useState(false);

  useEffect(() => {
    let intervalId;
    if (!isScanned) {
      intervalId = setInterval(async () => {
        try {
          const response = await axios.get(`/api/checkOrderStatus/${orderId}`);
          if (response.data.success) {
            setIsScanned(true);
            alert("Order status updated to Pending!");
          }
        } catch (error) {
          console.error("Error checking QR code scan status:", error);
        }
      }, 5000); // Poll every 5 seconds
    }
    return () => clearInterval(intervalId);
  }, [isScanned, orderId]);

  return (
    <div>
      <img src={qrCodeUrl} alt="QR Code for payment" />
      {isScanned ? (
        <p>Payment confirmed. Thank you!</p>
      ) : (
        <p>Please scan the QR code to complete your payment.</p>
      )}
    </div>
  );
}

export default ConfirmQRCodeScan;
