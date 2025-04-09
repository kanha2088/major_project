// components/ExcelFetcher.js
import * as XLSX from "xlsx";

export const fetchExcelData = async () => {
  try {
    const response = await fetch(`/users2.xlsx?ts=${Date.now()}`);
    if (!response.ok) throw new Error("Excel file not found.");

    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          const sheet = workbook.Sheets["Sheet1"] || workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          resolve(rows);
        } catch (error) {
          reject("Failed to parse Excel.");
        }
      };
      reader.onerror = () => reject("Error reading Excel.");
      reader.readAsArrayBuffer(blob);
    });
  } catch (err) {
    console.error("Excel fetch error:", err);
    throw err;
  }
};
