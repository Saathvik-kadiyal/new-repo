import React, { useEffect, useState } from "react";
import { DataGrid, GridOverlay } from "@mui/x-data-grid";
import Pagination from "@mui/material/Pagination";
import { Tooltip } from "@mui/material";
import {
  IconButton,
  Portal ,
  MenuItem,
  Select,
  TextField,
  Box,
  Typography,
  Button,
} from "@mui/material";
import { X, Eye, Info } from "lucide-react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import EmployeeModal from "./EmployeModel.jsx";
import { useEmployeeData } from "../hooks/useEmployeeData.jsx";

const formatMonth = (value) => {
  if (!value) return "";
  const [year, month] = value.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[Number(month) - 1]} - ${year}`;
};

const formatShiftDetails = (value) => {
  if (!value) return "";
  return Object.entries(value)
    .map(([shift, count]) => {
      const cleanShift = shift.replace(/\s*\(.*?\)/, "");
      return `${cleanShift}- ${count}`;
    })
    .join(", ");
};

const formatINR = (value) => {
  if (value == null || isNaN(value)) return "₹ 0.00";
  return `₹ ${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const DataTable = ({ headers }) => {

  const {
    modelOpen,
    setModelOpen,
    selectedEmployee,
    loadingDetail,
    error,
    page,
    totalPages,
    displayRows,
    debouncedFetch,
    handlePageChange,
    handleIndividualEmployee,
    getProcessedData,
    downloadSearchData,
    shiftSummary,   
  } = useEmployeeData();
  
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoPosition, setInfoPosition] = useState({ top: 0, left: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState("Emp ID");   
  const [errorSearch, setErrorSearch] = useState("");
  const [startMonth, setStartMonth] = useState(null);
  const [endMonth, setEndMonth] = useState(null);

  const [info, setInfo] = useState([
    { "A (9PM to 6AM) - ₹500": "" },
    { "B (4PM to 1AM) - ₹350": "" },
    { "C (6AM to 3PM) - ₹100": "" },
    { "PRIME (12AM to 9AM) - ₹700": "" },
  ]);
 const pattern = /^[A-Za-z]{2}[A-Za-z0-9-_ ]*$/;
  const columns = [
    ...headers.map((header) => {
      if (header === "Shift Details") {
        return {
          field: "Shift Details",
          headerName: "Shift Details",
          flex: 1,
          sortable: true,
          disableColumnMenu: true,

          renderHeader: () => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <span>Shift Details</span>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setInfoOpen((prev) => !prev);
                  setInfoOpen(true);

                  const rect = e.currentTarget.getBoundingClientRect();
                  const popupHeight = 100;
                  const iconHeight = rect.height;
                  setInfoPosition({
                    top:
                      rect.top +
                      window.scrollY +
                      iconHeight / 2 -
                      popupHeight / 2 -
                      100,
                    left: rect.left + window.scrollX - 100,
                  });
                }}
              >
                <Info size={16} />
              </IconButton>
            </Box>
          ),

          renderCell: (params) => formatShiftDetails(params.value),
        };
      }

     
      if (header === "Total Allowances") {
        return {
          field: "Total Allowances",
          headerName: "Total Allowances",
          flex: 1,
          sortable: true,
          disableColumnMenu: true,
          renderCell: (params) => formatINR(params.value),
        };
      }

      return {
        field: header,
        headerName: header,
        flex: 1,
        sortable: true,
        filterable: false,
        disableColumnMenu: true,
      };
    }),

    {
      field: "actions",
      headerName: "",
      width: 1,
      flex: 0,
      filterable: false,
      sortable: false,
      disableColumnMenu: true,
      disableColumnResize: true,
      resizable: false,

      renderCell: (params) => (
        <Button
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleIndividualEmployee(
              params.row["Emp ID"],
              params.row["Duration Month"],
              params.row["Payroll Month"]
            );
          }}
          disableRipple
          sx={{
            minWidth: 0,
            padding: "4px",
            backgroundColor: "transparent",
            "&:hover": { backgroundColor: "transparent" },
            "&:focus": { backgroundColor: "transparent" },
            "&:active": { backgroundColor: "transparent" },
            outline: "none",
            "&:focus-visible": { outline: "none" },
          }}
        >
          <Eye size={18} className="text-black hover:text-blue-600" />
        </Button>
      ),
    },
  ];

  columns.forEach((col) => {
    if (col.field === "Duration Month" || col.field === "Payroll Month") {
      col.renderCell = (params) => formatMonth(params.value);
    }
  });


  useEffect(() => {
    const start = (page - 1) * 10;

    let params = {};
    const q = searchQuery.trim();
    const validSearch = q.length > 2;
    if (validSearch) {
      if (searchBy === "Emp ID") params.emp_id = q;
      else if (searchBy === "Account Manager") params.account_manager = q;
      else if (searchBy === "Client") params.client = q;
      else if (searchBy === "Department") params.department = q;
    }
    if (startMonth) params.start_month = startMonth;
    if (endMonth) params.end_month = endMonth;

    const hasParams = Object.keys(params).length > 0;

    if (hasParams) {
     
      debouncedFetch(hasParams ? params : {}, page);

    } else {
      getProcessedData(start, 10);
    }
  }, [page, searchQuery, searchBy, startMonth, endMonth]);


  const handleDownload = () => {
    if (!searchQuery?.trim() && !startMonth)
      return alert(
        "Please enter a search query or select month(s) to download data."
      );

    if (searchQuery.trim() && startMonth) {
      return downloadSearchData({
        type: "SearchAndMonthRange",
        startMonth,
        endMonth,
        query: searchQuery.trim(),
        searchBy,
      });
    }

    if (searchQuery.trim()) {
      return downloadSearchData({
        type: "Text",
        query: searchQuery.trim(),
        searchBy,
      });
    }

    if (startMonth) {
      return downloadSearchData({
        type: "MonthRange",
        startMonth,
        endMonth,
      });
    }
  };
  const handleClear = () => {
    setSearchQuery("");
    setSearchBy("Emp ID");
    setErrorSearch("");
    setStartMonth(null);
    setEndMonth(null);
    handlePageChange(1);
  };


  return (
    <>
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
  {[
    { label: "Shift A", value: shiftSummary?.shiftA ?? 0, bg: "#03A9F4" },
    { label: "Shift B", value: shiftSummary?.shiftB ?? 0, bg: "#E91E63" },
    { label: "Shift C", value: shiftSummary?.shiftC ?? 0, bg: "#FF9800" },
    { label: "Prime", value: shiftSummary?.prime ?? 0, bg: "#9C27B0" },
    { label: "Total Allowances", value: shiftSummary?.total ?? 0, bg: "#4CAF50" },
  ].map(({ label, value, bg }) => (
    <Box
      key={label}
      sx={{
        flex: 1,
        height: 100,
        backgroundColor: bg,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#000",
      }}
    >
      <Typography variant="subtitle1" fontWeight={600}>
        {label}
      </Typography>

      <Typography variant="h3" fontWeight={700}>
        {value}
      </Typography>

    </Box>
  ))}
</Box>
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
        <Box>
          <Box sx={{ display: "flex", mb: 2, alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex" }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Select size="small" value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
                  <MenuItem value="Emp ID">Emp ID</MenuItem>
                  <MenuItem value="Account Manager">Account Manager</MenuItem>
                  <MenuItem value="Department">Department</MenuItem>
                  <MenuItem value="Client">Client</MenuItem>
                </Select>

                <Box sx={{ position: "relative", width: 300 }}>
                  <TextField
                    size="small"
                    placeholder={`Search by ${searchBy}...`}
                    value={searchQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchQuery(value);
                      if (!value) return setErrorSearch("");
                      if (!pattern.test(value)) {
                        setErrorSearch(
                          "First 2 characters must be letters, then letters, numbers or '-' allowed"
                        );
                      } else {
                        setErrorSearch("");
                      }
                    }}
                    error={Boolean(errorSearch)}
                    sx={{ width: "100%" }}
                  />
                  {errorSearch && (
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        color: "red",
                        fontSize: "11px",
                        mt: "2px",
                      }}
                    >
                      {errorSearch}
                    </Typography>
                  )}
                </Box>
              </Box>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  views={["year", "month"]}
                  label="Start Month"
                  value={startMonth ? dayjs(startMonth) : null}
                  onChange={(newValue) => setStartMonth(newValue ? newValue.format("YYYY-MM") : null)}
                  inputFormat="YYYY-MM"
                  disableFuture
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { width: 140, ml: 2 },
                      InputProps: {
                        endAdornment: startMonth && (
                          <IconButton size="small" onClick={() => setStartMonth(null)}>
                            <X size={16} />
                          </IconButton>
                        ),
                      },
                    },
                  }}
                />
                <DatePicker
                  views={["year", "month"]}
                  label="End Month"
                  value={endMonth ? dayjs(endMonth) : null}
                  onChange={(newValue) => setEndMonth(newValue ? newValue.format("YYYY-MM") : null)}
                  minDate={startMonth ? dayjs(startMonth) : undefined}
                  inputFormat="YYYY-MM"
                  disableFuture
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { width: 140, ml: 2 },
                      InputProps: {
                        endAdornment: endMonth && (
                          <IconButton size="small" onClick={() => setEndMonth(null)}>
                            <X size={16} />
                          </IconButton>
                        ),
                      },
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClear}
                  disabled={!searchQuery && !startMonth && !endMonth}
                  sx={{
                    ml: 1,
                    height: "40px",
                    textTransform: "none",
                    alignSelf: "center",
                  }}
                >
                  Clear
                </Button>
              </LocalizationProvider>
            </Box>
            <Tooltip title="Download Allowance Data">
              <Button
                variant="outlined"
                size="small"
                onClick={handleDownload}
                disabled={!searchQuery?.trim() && !startMonth}
                sx={{ textTransform: "none", px: 2, py: 1 }}
              >
                Download Data
              </Button>
            </Tooltip>
          </Box>

          <Box sx={{ flex: 1, mt: 2, height: "70vh", }}>
            <DataGrid
              rows={displayRows}
              columns={columns}
              disableRowSelectionOnClick
              disableColumnReorder
              disableColumnSorting
              pagination={false}
              hideFooter
              autoHeight={false}
              components={{
                NoRowsOverlay: () => (
                  <GridOverlay>
                    <Box sx={{ height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <Typography variant="body2" color="error.main">{error || "No rows found"}</Typography>
                    </Box>
                  </GridOverlay>
                ),
              }}
              sx={{
                flex: 1,
                border: "none",
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f5f5f5",
                  fontWeight: "bold",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                },
                "& .MuiDataGrid-virtualScroller": {
                  overflow: "auto",
                  scrollbarWidth: "none",
                },
                "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
                  display: "none",
                },

                "& .MuiDataGrid-scrollbar": {
                  display: "none",
                },
                "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold" },
                "& .MuiDataGrid-cell": { borderBottom: "none" },
                "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": { outline: "none !important" },
                "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": { outline: "none !important" },
              }}
            />
          </Box>

          {totalPages > 0 && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", p: 1 }}>
              <Pagination
                count={totalPages}

                page={page}
                onChange={(e, value) => handlePageChange(value)}
                color="primary"
                size="small"
                siblingCount={1}
                boundaryCount={1}
                shape="rounded"
              />
            </Box>
          )}
        </Box>

        {modelOpen && selectedEmployee && (
          <EmployeeModal employee={selectedEmployee} onClose={() => setModelOpen(false)} loading={loadingDetail} />
        )}

        {infoOpen && (
          <Portal>
            <Box
              onClick={(e) => {
                console.log(e)
                e.stopPropagation()
              }}
              sx={{
                position: "fixed",
                top: infoPosition.top,
                left: infoPosition.left,
                background: "white",
                boxShadow: 3,
                borderRadius: 1,
                p: 2,
                minWidth: 220,
                zIndex: 2000,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <IconButton
                  size="small"
                  onClick={() => setInfoOpen(false)}
                >
                  <X size={16} />
                </IconButton>
              </Box>

              {info.map((details, i) => {
                const key = Object.keys(details)[0];
                const value = Object.values(details)[0];
                return (
                  <Box
                    key={i}
                    sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
                  >
                    <Typography fontWeight={600}>{key}</Typography>
                    <Typography>{value}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Portal>
        )}
      </Box>
    </>
  );
};
export default DataTable;
