import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import CryptoJS from "crypto-js";
import "./Scanner.css";
import Table from "../Table";

const SECRET_KEY = "MySuperSecretKey123";

const Scanner = () => {
  const webcamRef = useRef(null);
  const [scannedData, setScannedData] = useState(null);
  const [warning, setWarning] = useState("Waiting for camera...");
  const [showCamera, setShowCamera] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [isPinCorrect, setIsPinCorrect] = useState(false);
  const [riceAmount, setRiceAmount] = useState("");
  const [isRiceAmountEntered, setIsRiceAmountEntered] = useState(false);
  const [userAllottedRice, setUserAllottedRice] = useState(null);
  const [year, setYear] = useState("");
  const [tableRefreshKey, setTableRefreshKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (showCamera && !isProcessing) {
        capture();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [showCamera, isProcessing]);

  const resetScanner = () => {
    setScannedData(null);
    setShowCamera(true);
    setIsProcessing(false);
    setEnteredPin("");
    setIsPinCorrect(false);
    setRiceAmount("");
    setIsRiceAmountEntered(false);
    setUserAllottedRice(null);
    setYear("");
    setWarning("Waiting for camera...");
  };

  const capture = () => {
    const video = webcamRef.current?.video;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setWarning("Camera not detected.");
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

    if (qrCode) {
      try {
        const decryptedBytes = CryptoJS.AES.decrypt(qrCode.data, SECRET_KEY);
        const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
        if (decryptedData.id !== scannedData?.id) {
          setScannedData(decryptedData);
          fetchUserAllottedRice(decryptedData.id);
          setWarning("");
          setShowCamera(false);
          setIsProcessing(true);
        }
      } catch (error) {
        setWarning("Invalid QR Code.");
      }
    } else {
      setWarning("No QR Code detected.");
    }
  };

  const fetchUserAllottedRice = async (userId) => {
    try {
      const response = await fetch("http://localhost:5001/get-user-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, type: "scanner" }),
      });
      const data = await response.json();

      if (data.error) {
        setWarning("ID not found in Excel.");
        setTimeout(() => {
          setWarning("Returning to scan...");
          setTimeout(() => {
            resetScanner();
            setWarning("");
          }, 1000);
        }, 5000);
        return;
      }

      setUserAllottedRice(data.totalRice * 1000);
      setYear(data.year);
    } catch (error) {
      console.error("Excel fetch error:", error);
      setWarning("Failed to fetch Excel data.");
    }
  };

  const handlePinSubmit = () => {
    if (enteredPin === scannedData.secretPin) {
      setIsPinCorrect(true);
      setWarning("");
    } else {
      setWarning("Incorrect PIN.");
    }
  };

  const handleRiceSubmit = () => {
    const rice = parseFloat(riceAmount);
    if (!rice || rice <= 0) {
      setWarning("Enter valid rice amount.");
      return;
    }

    if (rice > userAllottedRice) {
      setWarning(`Limit exceeded. Only ${(userAllottedRice / 1000).toFixed(2)} kg left.`);
      return;
    }

    setWarning("");
    setIsRiceAmountEntered(true);
    sendDataToServer();
  };

  const sendDataToServer = async () => {
    if (!scannedData || !riceAmount) return;

    const payload = { id: scannedData.id, riceAmount };

    try {
      const response = await fetch("http://localhost:5000/receive-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert("Failed to send data.");
    }
  };

  return (
    <div className="scanner-container">
      <div className="scanner-layout">
        <div className="user-info">
          {showCamera && (
            <div>
              <h2>Scan QR Code</h2>
              <div className="webcam-container">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/png"
                  videoConstraints={{ facingMode: "user", width: 640, height: 440 }}
                />
              </div>
            </div>
          )}

          {warning && <p className="warning-message">{warning}</p>}

          {scannedData && !isPinCorrect && (
            <div className="pin-input-container">
              <h1>Hello {scannedData.name} Enter your pin </h1><br></br>
              <h1>Enter PIN</h1><br></br>
              <input
                type="password"
                placeholder="Enter PIN"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
              />
              <button onClick={handlePinSubmit}>Submit</button>
            </div>
          )}

          {scannedData && isPinCorrect && !isRiceAmountEntered && (
            <div className="rice-input-container">
              <h1>Hello {scannedData.name} enter the rice amount </h1><br></br>
              <h1>Enter Rice (grams)</h1><br></br>
              <input
                type="number"
                placeholder="Enter rice amount"
                value={riceAmount}
                onChange={(e) => setRiceAmount(e.target.value)}
              />
              <button onClick={handleRiceSubmit}>Submit</button>
            </div>
          )}

          {scannedData && isPinCorrect && isRiceAmountEntered && (
            <div className="scanned-data-container">
              <div className="profile-navbar">
                <span>ID: {scannedData.id}</span>
                <span>Name: {scannedData.name}</span>
              </div>
              <div className="data-section">
                <div className="left-box">
                  <p><strong>Year:</strong> {year}</p>
                  <p><strong>Ordered:</strong> {riceAmount} grams</p>
                  <p><strong>Dispensed:</strong>{new Date().toLocaleDateString()}</p>
                </div>
                <div className="right-box">
                  <Table
                    scannedId={scannedData.id}
                    amount={riceAmount}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <button onClick={resetScanner} className="exit-button">Exit</button>
    </div>
  );
};

export default Scanner;
