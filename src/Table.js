import React, { useEffect, useState } from "react";
import "./Table.css";

const Table = ({ scannedId, amount }) => {
  const [userData, setUserData] = useState(null);
  const [months, setMonths] = useState([]);
  const [dispensed, setDispensed] = useState([]);
  const [allocatedKg, setAllocatedKg] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const currentMonthIndex = new Date().getMonth();
  const monthOrder = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonthName = monthOrder[currentMonthIndex];

  useEffect(() => {
    const fetchUserTableData = async () => {
      try {
        const response = await fetch("http://localhost:5001/get-user-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: scannedId, type: "table" }),
        });

        const data = await response.json();
        if (!data || data.error) return;

        setAllocatedKg(data.totalRice); // in KG

        const dispensedMap = { ...data.dispensed };

        // ✅ Add current month's new amount for display
        dispensedMap[currentMonthName] = 
          (dispensedMap[currentMonthName] || 0) + parseFloat(amount || 0);

        // ✅ Build sorted display data
        const sorted = monthOrder.filter((m) => dispensedMap[m] !== undefined);
        const sortedValues = sorted.map((month) => dispensedMap[month]);

        setMonths(sorted);
        setDispensed(sortedValues);
        setUserData({ id: scannedId });
      } catch (error) {
        console.error("Failed to fetch table data", error);
      }
    };

    fetchUserTableData();
  }, [refresh]);

  const handleRefresh = () => {
    setRefresh((prev) => prev + 1);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2500);
  };

  // ✅ Recalculate rice left with updated dispensed
  const totalDispensedGrams = dispensed.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const totalAllocatedGrams = allocatedKg * 1000;
  const riceLeftGrams = totalAllocatedGrams - totalDispensedGrams;
  const riceLeftKg = Math.floor(riceLeftGrams / 1000);
  const riceLeftG = riceLeftGrams % 1000;

  return (
    <div className="excel-container">
      <div className="right-panel">
        {userData ? (
          <>
            <div className="rice-summary">
              <h2>Current Year: {new Date().getFullYear()}</h2>
              <h2><strong>Rice Allocated:</strong> {allocatedKg} kg</h2>
              <h2><strong>Rice Remaining:</strong> {riceLeftKg} kg {riceLeftG} g</h2>
            </div>
            <div className="refresh-wrapper">
              <button className="refresh-btn" onClick={handleRefresh}>
                🔄 Refresh
              </button>
              <span className="tooltip-text">Click to load the latest data</span>
            </div>

            {showPopup && <div className="popup-message">✅ Data refreshed!</div>}
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Rice Dispensed (grams)</th>
                </tr>
              </thead>
              <tbody>
                {months.map((month, i) => (
                  <tr key={i}>
                    <td>{month}</td>
                    <td>{dispensed[i] || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p>No matching ID found.</p>
        )}
      </div>
    </div>
  );
};

export default Table;
