import { useState, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import {
  fetchEmployees,
  fetchEmployeeDetail,
  uploadFile,
  debounce,
  fetchEmployeesByMonthRange,
} from "../utils/helper.js";

export const UI_HEADERS = [
  "Emp ID",
  "Emp Name",
  "Department",
  "Shift Details",
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
  duration_month: "Duration Month",
  payroll_month: "Payroll Month",
  shift_details:"Shift Details"
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
  const [success,setSuccess]=useState('')
  
  useEffect(() => {
  if (success) {
    const timer = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(timer);
  }
}, [success]);

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

      const mappedRows = data.data.map((item, index) => ({
        id: `${item.emp_id}-${item.payroll_month}-${item.duration_month}-${index}`, // unique
        emp_id: item.emp_id,
        "Duration Month": item.duration_month,
        "Payroll Month": item.payroll_month,
        ...Object.fromEntries(
          Object.entries(FIELD_MAP).map(([key, label]) => [label, item[key] ?? ""])
        ),
      }));

      setRows(mappedRows);
      setTotalRecords(data.total_records || mappedRows.length);
      setTotalPages(Math.ceil((data.total_records || mappedRows.length) / limit));
      setError("");
    } catch (err) {
      setError("Failed to fetch data");
      setRows([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  },
  [token]
);




const debouncedFetch = useCallback(
  debounce(async (value, by, page = 1) => {
    if (!token) return;
    const start = (page - 1) * 10;

    // Search + Month Range
    if (by === "SearchAndMonthRange") {
      const { searchQuery, startMonth, endMonth } = value;
      const res = await fetchEmployees({
        token,
        searchBy: value.searchBy,
        searchQuery,
        start: 0,
        limit: 1000, // fetch all
      });

      const mappedRows = res.data
        .slice(start, start + 10)
        .map((item, index) => ({
          id: `${item.emp_id}-${item.payroll_month}-${item.duration_month}-${index}`,
          emp_id: item.emp_id,
          "Duration Month": item.duration_month,
          "Payroll Month": item.payroll_month,
          ...Object.fromEntries(
            Object.entries(FIELD_MAP).map(([k, v]) => [v, item[k] ?? ""])
          ),
        }));

      setRows(mappedRows);
      setTotalRecords(res.total_records || res.data.length);
      setTotalPages(Math.ceil((res.total_records || res.data.length) / 10));
      setError("");
      return;
    }

    // Month Range Only
    // 🔹 Month Range Only
if (by === "MonthRange") {
  const { startMonth, endMonth } = value;
  let res = [];

  try {
    res = await fetchEmployeesByMonthRange(token, startMonth, endMonth);
  } catch (err) {
    setRows([]);
    setTotalRecords(0);
    setTotalPages(0);
    setError(err.message); // display "No data found for month range ..."
    return;
  }

  if (!res || res.length === 0) {
    setRows([]);
    setTotalRecords(0);
    setTotalPages(0);
    setError(`No data found for month range ${startMonth} to ${endMonth}`);
    return;
  }

  const mappedRows = res
    .slice(start, start + 10)
    .map((item, index) => ({
      id: `${item.emp_id}-${item.payroll_month}-${item.duration_month}-${index}`,
      emp_id: item.emp_id,
      "Duration Month": item.duration_month,
      "Payroll Month": item.payroll_month,
      ...Object.fromEntries(
        Object.entries(FIELD_MAP).map(([k, v]) => [v, item[k] ?? ""])
      ),
    }));

  setRows(mappedRows);
  setTotalRecords(res.length);
  setTotalPages(Math.ceil(res.length / 10));
  setError(""); // clear error if data exists
  return;
}


    // Text Search Only
    const data = await fetchEmployees({
      token,
      searchBy: by,
      searchQuery: value,
      start,
      limit: 10,
    });

    const mappedRows = data.data.map((item, index) => ({
      id: `${item.emp_id}-${item.payroll_month}-${item.duration_month}-${index}`,
      emp_id: item.emp_id,
      "Duration Month": item.duration_month,
      "Payroll Month": item.payroll_month,
      ...Object.fromEntries(
        Object.entries(FIELD_MAP).map(([k, v]) => [v, item[k] ?? ""])
      ),
    }));

    setRows(mappedRows);
    setTotalRecords(data.total_records || mappedRows.length);
    setTotalPages(Math.ceil((data.total_records || mappedRows.length) / 10));
    setError("");
  }, 500),
  [token]
);


  useEffect(() => {
    setDisplayRows(rows);
  }, [rows]);

const fetchDataFromBackend = useCallback(
  async (file) => {
    if (!token) return;
    resetState();
    setLoading(true);

    try {
      const res = await uploadFile(token, file);

      setSuccess(res.message || "File processed successfully");
      getProcessedData((page - 1) * 10, 10);
    } 
  catch (err) {
    console.log(err)
  if (err) {
    const {status,detail} = err
    console.log(detail)
    if (detail) {

      if (detail.message) setError(detail.message);

      // Directly set error file link if present
      if (detail.error_file) setErrorFileLink(detail.error_file);

      setTimeout(() => getProcessedData((page - 1) * 10, 10), 1000);
      return;
    }

    // fallback
    setError(detail || "Unexpected server error");
  } else {
    setError("Network error, please try again");
  }
}

    finally {
      setLoading(false);
    }
  },
  [token, resetState, page, getProcessedData]
);




  const clearErrorFile = () => setErrorFileLink("");

  const getEmployeeDetailHandler = useCallback(
    async (emp_id, duration_month, payroll_month) => {
      if (!token) return;
      try {
        setLoadingDetail(true);
        const emp = await fetchEmployeeDetail(
          token,
          emp_id,
          duration_month,
          payroll_month
        );
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
    (emp_id, duration_month, payroll_month) =>
      getEmployeeDetailHandler(emp_id, duration_month, payroll_month),
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

    if (searchState.startMonth) {
      params.start_month = searchState.startMonth;
      if (searchState.endMonth) params.end_month = searchState.endMonth;
    }

    /** ---------- Text Search ---------- */
    if (searchState.query?.trim()) {
      const { query, searchBy } = searchState;

      if (searchBy === "Emp ID") params.emp_id = query.trim();
      if (searchBy === "Account Manager") params.account_manager = query.trim();
    }

    /** --- Validate: at least one filter required --- */
    if (!Object.keys(params).length) {
      return alert(
        "Please enter a search query or select month(s) to download data."
      );
    }

    const response = await axios.get(`${backendApi}/excel/download`, {
      params,
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
    });

    /** ---------- DOWNLOAD EXCEL ---------- */
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
    console.log(errorFileLink)
    try {
      const response = await axios.get(`${backendApi}/upload/error-files/${errorFileLink}`, {
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
    clearErrorFile,
    success
  };
};
