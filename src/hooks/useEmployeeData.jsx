import { useState, useCallback, useEffect, useRef } from "react";
import {
  fetchEmployees,
  fetchEmployeeDetail,
  uploadFile,
  debounce,
  toBackendMonthFormat,
} from "../utils/helper.js";

/* ================= HEADERS ================= */
export const UI_HEADERS = [
  "Emp ID",
  "Emp Name",
  "Department",
  "Shift Details",
  "Account Manager",
  "Client",
  "Duration Month",
  "Payroll Month",
  "Total Allowances",
];

export const EXPORT_HEADERS = [
  ...UI_HEADERS,
  "Project",
  "Practice Lead/ Head",
  "Delivery/ Project Manager",
  "Shift A\n(09 PM to 06 AM)\nINR 500",
  "Shift B\n(04 PM to 01 AM)\nINR 350",
  "Shift C\n(06 AM to 03 PM)\nINR 100",
  "Prime\n(12 AM to 09 AM)\nINR 700",
  "TOTAL DAYS",
];

/* ================= FIELD MAP ================= */
const FIELD_MAP = {
  emp_id: "Emp ID",
  emp_name: "Emp Name",
  department: "Department",
  account_manager: "Account Manager",
  client: "Client",
  duration_month: "Duration Month",
  payroll_month: "Payroll Month",
  shift_details: "Shift Details",
  total_allowance: "Total Allowances",
};

/* ================= HELPERS ================= */
const mapBackendToUI = (row) => {
  const uiRow = {};
  Object.entries(FIELD_MAP).forEach(([key, label]) => {
    uiRow[label] = row[key] ?? "";
  });
  return uiRow;
};

const buildSearchParams = (filters) => {
  const params = {};
  if (filters.emp_id) params.emp_id = filters.emp_id;
  if (filters.account_manager) params.account_manager = filters.account_manager;
  if (filters.department) params.department = filters.department;
  if (filters.client) params.client = filters.client;
  if (filters.start_month) params.start_month = toBackendMonthFormat(filters.start_month);
  if (filters.end_month) params.end_month = toBackendMonthFormat(filters.end_month);
  return params;
};

/* ================= HOOK ================= */
export const useEmployeeData = () => {
  const token = localStorage.getItem("access_token");
  const didInitialFetch = useRef(false);

  /* ---------- STATE ---------- */
  const [rows, setRows] = useState([]);
  const [displayRows, setDisplayRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modelOpen, setModelOpen] = useState(false);

  const [filters, setFilters] = useState({});
  const [shiftSummary, setShiftSummary] = useState(null);

  // File upload states
  const [errorRows, setErrorRows] = useState([]);
  const [errorFileLink, setErrorFileLink] = useState(null);
  const [success, setSuccess] = useState("");

  /* ================= FETCH EMPLOYEES ================= */
  const getProcessedData = useCallback(
    async (start = 0, limit = 10, params = {}) => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetchEmployees({ token, start, limit, params });
        const employees = res?.data?.employees || res?.data || [];

        // Shift summary row (last object without emp_id)
        const summaryRow = employees.find((e) => !e.emp_id);
        const employeeRows = employees.filter((e) => e.emp_id);

        if (summaryRow) {
          setShiftSummary({
            shiftA: summaryRow.shift_details?.["A(9PM to 6AM)"] ?? 0,
            shiftB: summaryRow.shift_details?.["B(4PM to 1AM)"] ?? 0,
            shiftC: summaryRow.shift_details?.["C(6AM to 3PM)"] ?? 0,
            prime: summaryRow.shift_details?.["PRIME(12AM to 9AM)"] ?? 0,
            total: summaryRow.total_allowance ?? 0,
          });
        } else {
          setShiftSummary(null);
        }

        const mapped = employeeRows.map((item, idx) => ({
          id: `${item.emp_id}-${item.duration_month}-${item.payroll_month}-${idx}`,
          ...mapBackendToUI(item),
          __fullEmployee: item, // preserve full object for modal
        }));

        setRows(mapped);
        setDisplayRows(mapped);
        setTotalRecords(res.total_records || mapped.length);
        setTotalPages(Math.ceil((res.total_records || mapped.length) / limit));
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data");
        setRows([]);
        setDisplayRows([]);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /* ================= FILTER APPLY ================= */
  const applyFilters = useCallback(
    async (newFilters, pageNo = 1) => {
      setFilters(newFilters);
      setPage(pageNo);
      const params = buildSearchParams(newFilters);
      const start = (pageNo - 1) * 10;
      await getProcessedData(start, 10, params);
    },
    [getProcessedData]
  );

  /* ================= DEBOUNCED FETCH ================= */
  const debouncedFetch = useCallback(
    debounce(async (params, pageNo = 1) => {
      const start = (pageNo - 1) * 10;
      await getProcessedData(start, 10, params);
    }, 500),
    [getProcessedData]
  );

  /* ================= INIT LOAD ================= */
  useEffect(() => {
    if (didInitialFetch.current) return;
    didInitialFetch.current = true;
    getProcessedData(0, 10);
  }, [getProcessedData]);

  /* ================= PAGINATION ================= */
  const handlePageChange = useCallback(
    (newPage) => {
      setPage(newPage);
      const params = buildSearchParams(filters);
      const start = (newPage - 1) * 10;
      getProcessedData(start, 10, params);
    },
    [filters, getProcessedData]
  );

  /* ================= EMPLOYEE DETAIL MODAL ================= */
  const handleIndividualEmployee = useCallback(
    async (emp_id, duration_month, payroll_month) => {
      if (!token) return;
      try {
        setLoadingDetail(true);
        const emp = await fetchEmployeeDetail(token, emp_id, duration_month, payroll_month);
        setSelectedEmployee(emp);
        setModelOpen(true);
      } finally {
        setLoadingDetail(false);
      }
    },
    [token]
  );

  /* ================= FILE UPLOAD HANDLER ================= */
  const fetchDataFromBackend = useCallback(
    async (file) => {
      if (!token) return;
      setLoading(true);
      setError("");
      setErrorRows([]);
      setErrorFileLink(null);
      setSuccess("");

      try {
        const res = await uploadFile(token, file);
        setSuccess(res.message || "File uploaded successfully");
      } catch (err) {
        if (err?.detail) {
          if (err.detail.message) setError(err.detail.message);
          if (err.detail.error_file) setErrorFileLink(err.detail.error_file);
          if (err.detail.error_rows) setErrorRows(err.detail.error_rows);
        } else {
          setError("Network error, please try again");
        }
      } finally {
        setLoading(false);
        setTimeout(() => getProcessedData(0, 10), 200);
      }
    },
    [token, getProcessedData]
  );

  /* ================= RETURN ================= */
  return {
    UI_HEADERS,
    EXPORT_HEADERS,

    rows,
    displayRows,
    page,
    totalPages,
    totalRecords,

    loading,
    loadingDetail,
    error,

    selectedEmployee,
    modelOpen,
    setModelOpen,

    filters,
    shiftSummary,

    getProcessedData,
    applyFilters,
    debouncedFetch,
    handlePageChange,
    handleIndividualEmployee,

    // File upload related
    fetchDataFromBackend,
    errorRows,
    setErrorRows,
    errorFileLink,
    success,
  };
};
