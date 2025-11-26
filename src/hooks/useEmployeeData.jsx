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
  "Duration Month",
  "Payroll Month",
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
  duration_month:"Duration Month",
  payroll_month:"Payroll Month"
};

const backendApi = import.meta.env.VITE_BACKEND_API;

export const useEmployeeData = () => {
  const [rows, setRows] = useState([]);
  const [displayRows, setDisplayRows] = useState([]);
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
    [token]
  );

  const debouncedFetch = useCallback(
    debounce(async (value, by) => {
      if (!token) return;

      // MonthRange search
      if (by === "MonthRange") {
        const { startMonth, endMonth } = value;

        if (!startMonth) return; // at least start month must exist

        try {
          setLoading(true);
          const params= { start_month: startMonth };
          if (endMonth) params.end_month = endMonth;

          const res = await axios.get(`${backendApi}/monthly/search`, {
            params,
            headers: { Authorization: `Bearer ${token}` },
          });

          const mappedRows = res.data.map((item) => {
            const filtered = { emp_id: item.emp_id };
            Object.entries(FIELD_MAP).forEach(([key, label]) => {
              filtered[label] = item[key] ?? "";
            });
            return filtered;
          });

          setRows(mappedRows);
          setTotalRecords(mappedRows.length);
          setTotalPages(Math.ceil(mappedRows.length / 10));
          setPage(1);
          setError("");

        } catch (err) {
          const message =
            err.response?.data?.detail || "No data found for selected month(s)";
          setError(message);
          setRows([]);
          setTotalRecords(0);
          setTotalPages(0);
          setPage(1);
        } finally {
          setLoading(false);
        }

        return; // stop further processing
      }

      // normal text search
     if (!value || (typeof value === "string" && value.trim().length < 1)) {
  console.log(value);
  setError("");
  getProcessedData((page - 1) * 10, 10);
  return;
}


      try {
        setLoading(true);
        const data = await fetchEmployees({ token, searchBy: by, searchQuery: value });
        const mappedRows = Array.isArray(data.data)
          ? data.data.map((item) => {
              const filtered = { emp_id: item.emp_id };
              Object.entries(FIELD_MAP).forEach(([key, label]) => {
                filtered[label] = item[key] ?? "";
              });
              return filtered;
            })
          : [];

        setRows(mappedRows);
        setTotalRecords(mappedRows.length);
        setTotalPages(Math.ceil(mappedRows.length / 10));
        setPage(1);
        setError("");
      } catch (err) {
        const message = err.response?.data?.detail || "Failed to fetch results";
        setError(message);
        setRows([]);
        setTotalRecords(0);
        setTotalPages(0);
        setPage(1);
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

  const clearErrorFile = () => setErrorFileLink("");

  const getEmployeeDetailHandler = useCallback(
    async (emp_id,duration_month,payroll_month) => {
      if (!token) return;
      try {
        setLoadingDetail(true);
        const emp = await fetchEmployeeDetail(token, emp_id,duration_month,payroll_month);
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
    (emp_id,duration_month,payroll_month) =>
      getEmployeeDetailHandler(emp_id,duration_month,payroll_month),
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

const downloadSearchData = useCallback(async (searchState) => {
  try {
    const token = localStorage.getItem("access_token");
    const params = {};

    // --- Month range ---
    if (searchState.startMonth) {
      params.start_month = searchState.startMonth;
      if (searchState.endMonth) params.end_month = searchState.endMonth;
    }

    // --- Text search ---
    if (searchState.query?.trim()) {
      const { query, searchBy } = searchState;
      if (searchBy === "Emp ID") params.emp_id = query.trim();
      if (searchBy === "Account Manager") params.account_manager = query.trim();
    }

    // Validate: at least one filter required
    if (!Object.keys(params).length) {
      return alert("Please enter a search query or select month(s) to download data.");
    }

    const response = await axios.get(`${backendApi}/excel/download`, {
      params,
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Allowance_Data.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error(err);
    alert(err?.response?.data?.detail || "Failed to download search data");
  }
}, []);


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

  const handlePageChange = useCallback((newPage) => setPage(newPage), []);

  useEffect(() => {
    getProcessedData(0, 10);
  }, []);

  return {
    UI_HEADERS,
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
    downloadSearchData,
    downloadErrorExcel,
    handleIndividualEmployee,
    resetState,
    debouncedFetch,
    onSave,
    setOnSave,
    handlePageChange,
    clearErrorFile
  };
};
