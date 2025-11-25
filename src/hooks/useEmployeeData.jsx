import { useState, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import {
  fetchEmployees,
  fetchEmployeeDetail,
  uploadFile,
  debounce,
} from "../utils/helper.js";

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

const FIELD_MAP = {
  emp_id: "Emp ID",
  emp_name: "Emp Name",
  department: "Department",
  project_code: "Project Code",
  account_manager: "Account Manager",
  client: "Client",
};

export const useEmployeeData = () => {
  const [rows, setRows] = useState([]); // all fetched rows (search or normal)
  const [displayRows, setDisplayRows] = useState([]); // rows to show for current page
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const [errorFileLink, setErrorFileLink] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modelOpen, setModelOpen] = useState(false);
  const [onSave, setOnSave] = useState(false);

  const token = localStorage.getItem("access_token");

  const resetState = useCallback(() => {
    setRows([]);
    setDisplayRows([]);
    setTotalRecords(0);
    setError("");
    setErrorFileLink(null);
    setSelectedEmployee(null);
    setModelOpen(false);
  }, []);

  // Normal paginated fetch
  const getProcessedData = useCallback(
    async (start = 0, limit = 10) => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await fetchEmployees({ token, start, limit });
        const mappedRows = Array.isArray(data.data)
          ? data.data.map((item) => {
              const filtered = { emp_id: item.emp_id };
              Object.entries(FIELD_MAP).forEach(([key, label]) => {
                filtered[label] = item[key] ?? "";
              });
              const shifts = item.shift_mappings || [];
              filtered["TOTAL DAYS"] = shifts.reduce(
                (acc, s) => acc + (s.days || 0),
                0
              );
              return filtered;
            })
          : [];
          setError("");
        setRows(mappedRows);
        setTotalRecords(data.total_records || 0);
        setTotalPages(Math.ceil((data.total_records || 0) / limit));
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const debouncedFetch = useCallback(
    debounce(async (query, by) => {
      if (!token) return;

      if (!query || query.trim().length < 1) {
         setError(""); 
        getProcessedData((page - 1) * 10, 10);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchEmployees({
          token,
          searchBy: by,
          searchQuery: query,
        });
        const mappedRows = Array.isArray(data.data)
          ? data.data.map((item) => {
              const filtered = { emp_id: item.emp_id };
              Object.entries(FIELD_MAP).forEach(([key, label]) => {
                filtered[label] = item[key] ?? "";
              });
              const shifts = item.shift_mappings || [];
              filtered["TOTAL DAYS"] = shifts.reduce(
                (acc, s) => acc + (s.days || 0),
                0
              );
              return filtered;
            })
          : [];
            setError("");
        setRows(mappedRows);
        setTotalRecords(mappedRows.length);
        setTotalPages(Math.ceil(mappedRows.length / 10));
        setPage(1); 
      } catch (err) {
        console.error(err);
        setError("Failed to fetch search results");
      } finally {
        setLoading(false);
      }
    }, 500),
    [token, page, getProcessedData]
  );

  useEffect(() => {
    const start = (page - 1) * 10;
    setDisplayRows(rows.slice(start, start + 10));
  }, [rows, page]);

const fetchDataFromBackend = useCallback(
  async (file) => {
    if (!token) return;
    resetState();
    setLoading(true);

    try {
      const data = await uploadFile(token, file);
      if (data.download_link) setErrorFileLink(data.download_link);
      setTimeout(() => getProcessedData((page - 1) * 10, 10), 1200);

    } catch (err) {
      console.error(err);
      setError(err.message || "An unknown error occurred during file upload");
    } finally {
      setLoading(false);
    }
  },
  [token, resetState, page, getProcessedData]
);


  const getEmployeeDetailHandler = useCallback(
    async (id) => {
      if (!token) return;
      try {
        setLoadingDetail(true);
        const emp = await fetchEmployeeDetail(token, id);
        setSelectedEmployee(emp);
        setModelOpen(true);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch employee details");
      } finally {
        setLoadingDetail(false);
      }
    },
    [token]
  );

  const handleIndividualEmployee = useCallback(
    (id) => getEmployeeDetailHandler(id),
    [getEmployeeDetailHandler]
  );

  const downloadExcel = useCallback(() => {
    const headers = EXPORT_HEADERS;
    const exportData = rows.map((r) => {
      const copy = {};
      headers.forEach((h) => (copy[h] = r[h] || ""));
      return copy;
    });
    const ws = XLSX.utils.json_to_sheet(exportData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Data");
    XLSX.writeFile(
      wb,
      rows.length ? "Allowance_Data.xlsx" : "Allowance_Template.xlsx"
    );
  }, [rows]);

  const downloadErrorExcel = useCallback(async () => {
    if (!errorFileLink) return alert("No error file available");
    try {
      const response = await axios.get(errorFileLink, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Error_File.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Download failed");
    }
  }, [errorFileLink, token]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

useEffect(() => {
  getProcessedData(0, 10);
}, []); 


  return {
    EXPORT_HEADERS,
    rows,
    displayRows,
    totalRecords,
    totalPages,
    page,
    loading,
    loadingDetail,
    error,
    errorFileLink,
    selectedEmployee,
    modelOpen,
    setModelOpen,
    fetchDataFromBackend,
    getProcessedData,
    getEmployeeDetail: getEmployeeDetailHandler,
    downloadExcel,
    downloadErrorExcel,
    handleIndividualEmployee,
    resetState,
    debouncedFetch,
    onSave,
    setOnSave,
    handlePageChange,
  };
};
