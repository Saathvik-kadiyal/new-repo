import { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

export const UI_HEADERS = [
  "Emp ID",
  "Emp Name",
  "Department",
  "Project Code",
  "Account Manager",
  "Client",
];

export const EXPORT_HEADERS = [
  ...UI_HEADERS,
  "Project",
  "Project Code",
  "Account Manager",
  "Practice Lead/ Head",
  "Delivery/ Project Manager",
  "Duration Month",
  "Payroll Month",
  "Shift A (09 PM to 06 AM) INR 500",
  "Shift B (04 PM to 01 AM) INR 350",
  "Shift C (06 AM to 03 PM) INR 100",
  "Prime (12 AM to 09 AM) INR 700",
  "# Shift Types(e)",
  "TOTAL DAYS",
  "Timesheet Billable Days",
  "Timesheet Non Billable Days",
  "Diff",
  "Final Total Days",
  "Billability Status",
  "Practice Remarks",
  "RMG Comments",
  "Amar Approval",
  "Shift A Allowances",
  "Shift B Allowances",
  "Shift C Allowances",
  "Prime Allowances",
  "TOTAL DAYS Allowances",
  "AM Email Attempt(e)",
  "AM Approval Status(e)",
];

export const useEmployeeData = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parseExcel = async (file) => {
    try {
      setLoading(true);
      setError("");

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array", raw: false });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const sheetData = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

      if (sheetData.length === 0) {
        setRows([]);
        return;
      }

      const cleanedData = sheetData.map((row) => {
        const newRow = {};
        EXPORT_HEADERS.forEach((header) => {
          let cell = row[header] ?? "";
          if (typeof cell === "string" && cell.trim() === "₹-") cell = "₹0";
          newRow[header] = cell;
        });
        return newRow;
      });

      setRows(cleanedData);
    } catch (err) {
      console.error(err);
      setError("Failed to parse Excel file");
    } finally {
      setLoading(false);
    }
  };

  const fetchDataFromBackend = async (file) => {
    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data.map((row) => ({ ...row }));
      setRows(data);
    } catch (err) {
      console.error(err);
      setError("Error fetching data from backend");
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    const headers = EXPORT_HEADERS;

    const exportData =
      rows.length === 0
        ? []
        : rows.map((r) => {
            const copy = {};
            headers.forEach((h) => (copy[h] = r[h]));
            return copy;
          });

    const ws = XLSX.utils.json_to_sheet(exportData, { header: headers });

    if (rows.length === 0) XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Data");

    const fileName = rows.length === 0 ? "Allowance_Template.xlsx" : "Allowance_Data.xlsx";
    XLSX.writeFile(wb, fileName);
  };

  return {
    rows,
    loading,
    error,
    UI_HEADERS,
    EXPORT_HEADERS,
    parseExcel,
    fetchDataFromBackend,
    downloadExcel,
  };
};
