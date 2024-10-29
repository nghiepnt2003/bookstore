import axios from "axios";

function ConfirmQRCodeScan({ orderId }) {
  const handleQRCodeScanned = async () => {
    try {
      const response = await axios.post("/api/confirmQRCodeScan", { orderId });
      if (response.data.success) {
        alert("Order status updated to Pending!");
      } else {
        alert(`Failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error confirming QR scan:", error);
      alert("Failed to confirm QR scan.");
    }
  };

  return (
    <div>
      <button onClick={handleQRCodeScanned}>Confirm QR Code Scan</button>
    </div>
  );
}

export default ConfirmQRCodeScan;
