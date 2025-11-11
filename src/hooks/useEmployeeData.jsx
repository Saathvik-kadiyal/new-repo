import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

//Static Headers
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
  "Practice Lead/ Head",
  "Delivery/ Project Manager",
  "Duration Month",
  "Payroll Month",
  "Shift A\n(09 PM to 06 AM)\nINR 500",
  "Shift B\n(04 PM to 01 AM)\nINR 350",
  "Shift C\n(06 AM to 03 PM)\nINR 100",
  "Prime\n(12 AM to 09 AM)\nINR 700",
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
];

//Field Mapping
const FIELD_MAP = {
  emp_id: "Emp ID",
  emp_name: "Emp Name",
  department: "Department",
  project_code: "Project Code",
  account_manager: "Account Manager",
  client: "Client",
};

//Hook
export const useEmployeeData = () => {
  const [rows, setRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const [errorFileLink, setErrorFileLink] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modelOpen, setModelOpen] = useState(false);

  const token = localStorage.getItem("access_token");

  //Helper to Reset All States
  const resetState = useCallback(() => {
    setRows([]);
    setTotalRecords(0);
    setError("");
    setErrorFileLink(null);
    setSelectedEmployee(null);
    setModelOpen(false);
  }, []);

  // Upload & Process File
  const fetchDataFromBackend = useCallback(
    async (file) => {
      if (!token) {
        setError("Not authenticated");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      resetState();
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post("http://localhost:8000/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;

        if (data.download_link) {
          setErrorFileLink(data.download_link);
          alert(
            `Some records failed.\n\nInserted: ${data.records_inserted}\nSkipped: ${data.records_skipped}\n\nClick "Download Error File" to review them.`
          );
        } else if (data.records) {
          alert(`File processed successfully: ${data.records} records inserted.`);
        } else {
          alert("File uploaded successfully, but no details returned.");
        }

        // Fetch processed data after upload
        setTimeout(() => getProcessedData(0, 10), 1000);
      } catch (err) {
        console.error("Upload error:", err);
        resetState();

        if (err.response?.status === 401) {
          setError("Unauthorized — please login again.");
          localStorage.clear();
          window.location.href = "/login";
        } else if (err.response?.status === 400) {
          setError(err.response.data?.detail || "Invalid file format.");
        } else {
          setError("Server error while uploading file.");
        }
      } finally {
        setLoading(false);
      }
    },
    [token, resetState]
  );

  //Fetch Paginated Display Data
  const getProcessedData = useCallback(
    async (start = 0, limit = 10) => {
      if (!token) {
        setError("Not authenticated");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      try {
        setLoading(true);

        const response = await axios.get(
          `http://localhost:8000/display/?start=${start}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { total_records, data } = response.data;

        const mappedRows = Array.isArray(data)
          ? data.map((item) => {
              const filtered = { id: item.id };
              Object.entries(FIELD_MAP).forEach(([key, label]) => {
                filtered[label] = item[key] ?? "";
              });
              return filtered;
            })
          : [];

        setRows(mappedRows);
        setTotalRecords(total_records || 0);
      } catch (err) {
        console.error("Data fetch error:", err);
        resetState();

        if (err.response?.status === 404) {
          setError("No data found yet.");
        } else if (err.response?.status === 401) {
          setError("Unauthorized — please login again.");
          localStorage.clear();
          window.location.href = "/login";
        } else {
          setError("Failed to fetch processed data.");
        }
      } finally {
        setLoading(false);
      }
    },
    [token, resetState]
  );

  // Fetch Employee Detail
  const getEmployeeDetail = useCallback(
    async (id) => {
      if (!token) {
        setError("Unauthorized — please login again.");
        localStorage.clear();
        window.location.href = "/login";
        return null;
      }

      try {
        setLoadingDetail(true);
        setError("");

        const response = await axios.get(`http://localhost:8000/display/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSelectedEmployee(response.data);
        setModelOpen(true);
        return response.data;
      } catch (err) {
        console.error("Employee detail fetch error:", err);
        if (err.response?.status === 404) {
          setError("Employee not found.");
        } else if (err.response?.status === 401) {
          setError("Unauthorized — please login again.");
          localStorage.clear();
          window.location.href = "/login";
        } else {
          setError("Failed to fetch employee details.");
        }
        return null;
      } finally {
        setLoadingDetail(false);
      }
    },
    [token]
  );

//handleIndividualEmployee
const handleIndividualEmployee = async (id) => {
  console.log("Fetching details for employee ID:", id);
  if (!token) {
    setError("Unauthorized — please login again.");
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }
  try {
    setLoadingDetail(true);
    setError("");

    const response = await axios.get(`http://localhost:8000/display/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
console.log("Employee details fetched:", response.data);
    setSelectedEmployee(response.data);
    setModelOpen(true); 
    return response.data;
  } catch (err) {
    console.error("Employee detail fetch error:", err);
    if (err.response?.status === 404) {
      setError("Employee not found.");
    } else if (err.response?.status === 401) {
      setError("Unauthorized — please login again.");
      localStorage.clear();
      window.location.href = "/login";
    } else {
      setError("Failed to fetch employee details.");
    }
    return null;
  } finally {
    setLoadingDetail(false);
  }
};


  //Download Excel
  const downloadExcel = useCallback(() => {
    const headers = EXPORT_HEADERS;
    const exportData =
      rows.length === 0
        ? []
        : rows.map((r) => {
            const copy = {};
            headers.forEach((h) => (copy[h] = r[h] || ""));
            return copy;
          });

    const ws = XLSX.utils.json_to_sheet(exportData, { header: headers });
    if (rows.length === 0)
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Data");

    const fileName =
      rows.length === 0 ? "Allowance_Template.xlsx" : "Allowance_Data.xlsx";
    XLSX.writeFile(wb, fileName);
  }, [rows]);

  // Download Error Excel
  const downloadErrorExcel = useCallback(async () => {
    if (!errorFileLink) {
      alert("No error file available.");
      return;
    }

    try {
      const response = await axios.get(errorFileLink, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentDisposition = response.headers["content-disposition"];
      const fileNameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
      const fileName = fileNameMatch ? fileNameMatch[1] : "Error_File.xlsx";

      const blob = new Blob([response.data], { type: response.data.type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading Excel file:", err);
      alert("Failed to download error Excel file. Please try again.");
    }
  }, [errorFileLink, token]);

  return {
    EXPORT_HEADERS,
    rows,
    totalRecords,
    loading,
    loadingDetail,
    error,
    errorFileLink,
    selectedEmployee,
    handleIndividualEmployee,
    modelOpen,
    setModelOpen,
    fetchDataFromBackend,
    getProcessedData,
    getEmployeeDetail,
    downloadExcel,
    downloadErrorExcel,
    resetState,
  };
};
