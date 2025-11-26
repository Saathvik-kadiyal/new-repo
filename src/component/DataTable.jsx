import React, { useEffect, useState, useRef } from "react";
import { DataGrid, GridOverlay } from "@mui/x-data-grid";
import { IconButton, InputAdornment } from "@mui/material";
import { X } from "lucide-react";
import {
  MenuItem,
  Select,
  TextField,
  Box,
  Typography,
  Button,
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

import EmployeeModal from "./EmployeModel.jsx";
import { useEmployeeData } from "../hooks/useEmployeeData.jsx";
import { Eye } from "lucide-react";

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
  } = useEmployeeData();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState("Emp ID");
  const [errorSearch, setErrorSearch] = useState("");
  const [startMonth, setStartMonth] = useState(null);
  const [endMonth, setEndMonth] = useState(null);

  const pattern = /^[A-Za-z]{2}[A-Za-z0-9-_ ]*$/;
  const firstRender = useRef(true);

  const monthDebounceRef = useRef(null);

  const columns = [
    ...headers.map((header) => ({
      field: header,
      headerName: header,
      flex: 1,
      sortable: true,
      disableColumnMenu: true,
    })),
    {
      field: "actions",
      headerName: "",
      width: 1,
      flex: 0,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row selection/drag
            handleIndividualEmployee(
              params.row["Emp ID"],
              params.row["Duration Month"],
              params.row["Payroll Month"]
            );
          }}
          sx={{ minWidth: 0, padding: "4px" }}
        >
          <Eye color="black" size={16} />
        </Button>
      ),
    },
  ];

useEffect(() => {
  if (errorSearch) return;
  if (firstRender.current) {
    firstRender.current = false;
    return;
  }

  if (searchQuery.trim().length > 3) {
    // Text search
    debouncedFetch(searchQuery, searchBy);
  } else if (startMonth) {
    // Month range search
    debouncedFetch({ startMonth, endMonth }, "MonthRange");
  } else if (!searchQuery && !startMonth) {
    getProcessedData((page - 1) * 10, 10);
  }
}, [searchQuery, searchBy, startMonth, endMonth, page, errorSearch]);




  // Auto search when month range changes
  useEffect(() => {
    if (!startMonth) return;

    if (monthDebounceRef.current) clearTimeout(monthDebounceRef.current);

    monthDebounceRef.current = setTimeout(() => {
      debouncedFetch({ startMonth, endMonth }, "MonthRange");
    }, 1000);

    return () => clearTimeout(monthDebounceRef.current);
  }, [startMonth, endMonth]);

  // Unified download handler
 // Unified Download Button Handler
const handleDownload = () => {
  const params = {};

  // Add month range if selected
  if (startMonth) {
    params.start_month = startMonth;
    if (endMonth) params.end_month = endMonth;
  }

  // Add text search if provided
  if (searchQuery?.trim()) {
    if (searchBy === "Emp ID") params.emp_id = searchQuery.trim();
    else if (searchBy === "Account Manager") params.account_manager = searchQuery.trim();
  }

  if (!Object.keys(params).length) {
    return alert("Please enter a search query or select month(s) to download data.");
  }
  downloadSearchData({
    type: startMonth ? "MonthRange" : "Text", 
    startMonth,
    endMonth,
    query: searchQuery.trim(),
    searchBy,
  });
};


  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Search Box */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Text Search */}
        <Select
          size="small"
          value={searchBy}
          onChange={(e) => setSearchBy(e.target.value)}
        >
          <MenuItem value="Emp ID">Emp ID</MenuItem>
          <MenuItem value="Account Manager">Account Manager</MenuItem>
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

      <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* Start Month Picker */}
      <DatePicker
        views={["year", "month"]}
        label="Start Month"
        value={startMonth ? dayjs(startMonth) : null}
        onChange={(newValue) => {
          setStartMonth(newValue ? newValue.format("YYYY-MM") : null);
          if (endMonth && dayjs(endMonth).isBefore(newValue, "month")) {
            setEndMonth(null);
          }
        }}
        inputFormat="YYYY-MM"
        slotProps={{
          textField: {
            size: "small",
            sx: { width: 140 },
            InputProps: {
              endAdornment: (
                <InputAdornment position="end">
                  {startMonth && (
                    <IconButton size="small" onClick={() => setStartMonth(null)}>
                      <X size={16} />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            },
          },
        }}
      />

      {/* End Month Picker */}
      <DatePicker
        views={["year", "month"]}
        label="End Month"
        value={endMonth ? dayjs(endMonth) : null}
        onChange={(newValue) => setEndMonth(newValue ? newValue.format("YYYY-MM") : null)}
        minDate={startMonth ? dayjs(startMonth) : undefined}
        inputFormat="YYYY-MM"
        slotProps={{
          textField: {
            size: "small",
            sx: { width: 140, ml: 2 },
            InputProps: {
              endAdornment: (
                <InputAdornment position="end">
                  {endMonth && (
                    <IconButton size="small" onClick={() => setEndMonth(null)}>
                      <X size={16} />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            },
          },
        }}
      />
    </LocalizationProvider>



        <Button
  variant="contained"
  size="small"
  onClick={handleDownload}
  disabled={!searchQuery?.trim() && !startMonth}
>
  Download Data
</Button>

      </Box>

      {/* DataGrid */}
      <Box sx={{ flex: 1 }}>
        <DataGrid
          rows={displayRows}
          columns={columns}
          disableRowSelectionOnClick
          disableColumnReorder
          pagination={false}
          hideFooter
          autoHeight={false}
          getRowId={(row) => row.emp_id}
          components={{
            NoRowsOverlay: () => (
              <GridOverlay>
                <Box
                  sx={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="error.main">
                    {error || "No rows found"}
                  </Typography>
                </Box>
              </GridOverlay>
            ),
          }}
          sx={{
            flex: 1,
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "transparent",
              fontWeight: 600,
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
          }}
        />
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            p: 1,
          }}
        >
          <Button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
            Prev
          </Button>
          <Typography sx={{ px: 2 }}>
            Page {page} of {totalPages}
          </Typography>
          <Button disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}>
            Next
          </Button>
        </Box>
      )}

      {/* Modal */}
      {modelOpen && selectedEmployee && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={() => setModelOpen(false)}
          loading={loadingDetail}
        />
      )}
    </Box>
  );
};

export default DataTable;
