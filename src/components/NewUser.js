import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import CryptoJS from "crypto-js"; // Import encryption library
import "./NewUser.css"; // Import the external CSS for styling

const SECRET_KEY = "MySuperSecretKey123"; // Use a strong key

const NewUser = () => {
  const [user, setUser] = useState({
    id: "",
    name: "",
    age: "",
    riceAllotment: "5kg",
    status: "Not Taken",
    secretPin: "", // New field for PIN
  });
  const [qrData, setQrData] = useState("");
  const qrRef = useRef(null);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const generateQR = () => {
    if (!user.id || !user.name || !user.age || !user.secretPin) {
      alert("Please fill all fields, including PIN");
      return;
    }
    if (isNaN(user.id) || isNaN(user.age)) {
      alert("User ID and Age must be numbers");
      return;
    }

    // Encrypt the user data
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(user), SECRET_KEY).toString();

    setQrData(encryptedData); // Store the encrypted QR code
  };

  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR_${user.name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const copyQRData = () => {
    navigator.clipboard.writeText(qrData);
    alert("QR Data copied to clipboard!");
  };

  return (
    <div className="new-user-container">
      <div className="form-container">
        <h2 className="form-title">Register New User</h2>
        <input type="number" name="id" placeholder="User ID" onChange={handleChange} className="form-input" />
        <input type="text" name="name" placeholder="Name" onChange={handleChange} className="form-input" />
        <input type="number" name="age" placeholder="Age" onChange={handleChange} className="form-input" />
        <input type="password" name="secretPin" placeholder="Secret PIN" onChange={handleChange} className="form-input" />
        <button onClick={generateQR} className="generate-btn">Generate QR Code</button>
      </div>

      {/* QR Code Display */}
      {qrData && (
        <div className="qr-code-box">
          <h3>Your Secure QR Code:</h3>
          <div ref={qrRef}>
            <QRCodeCanvas value={qrData} size={300} />
          </div>
          <div className="qr-btns">
            <button onClick={downloadQRCode} className="download-btn">⬇ Download QR</button>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default NewUser;
