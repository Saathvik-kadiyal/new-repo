import React, { useEffect, useState, useRef } from "react";
import { DataGrid, GridOverlay } from "@mui/x-data-grid";
import { IconButton, InputAdornment, MenuItem, Select, TextField, Box, Typography, Button } from "@mui/material";
import { X, Eye } from "lucide-react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

import EmployeeModal from "./EmployeModel.jsx";
import { useEmployeeData } from "../hooks/useEmployeeData.jsx";

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

  console.log(displayRows)

  const pattern = /^[A-Za-z]{2}[A-Za-z0-9-_ ]*$/;

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
            e.stopPropagation();
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
    const start = (page - 1) * 10;
    if (searchQuery.trim().length > 3 && startMonth) return;

    if (searchQuery.trim().length > 3) {
      debouncedFetch(searchQuery, searchBy, page);
    } else if (startMonth) {
      debouncedFetch({ startMonth, endMonth }, "MonthRange", page);
    } else {
      getProcessedData(start, 10);
    }
  }, [page]);



  useEffect(() => {
    if (searchQuery.trim().length > 3 && startMonth) return;

    if (searchQuery.trim().length > 3) {
      debouncedFetch(searchQuery, searchBy, 1);
    } else if (startMonth) {
      debouncedFetch({ startMonth, endMonth }, "MonthRange", 1);
    } else if (!searchQuery && !startMonth) {
      getProcessedData(0, 10);
    }
  }, [searchQuery, searchBy, startMonth, endMonth]);

  const handleDownload = () => {
    if (!searchQuery?.trim() && !startMonth)
      return alert("Please enter a search query or select month(s) to download data.");

    // Combined condition handled only here ⛳
    if (searchQuery.trim() && startMonth) {
      return downloadSearchData({
        type: "SearchAndMonthRange",
        startMonth,
        endMonth,
        query: searchQuery.trim(),
        searchBy,
      });
    }

    // Search only
    if (searchQuery.trim()) {
      return downloadSearchData({
        type: "Text",
        query: searchQuery.trim(),
        searchBy,
      });
    }

    // Month only
    if (startMonth) {
      return downloadSearchData({
        type: "MonthRange",
        startMonth,
        endMonth,
      });
    }
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Search / Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        <Select size="small" value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
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
                setErrorSearch("First 2 characters must be letters, then letters, numbers or '-' allowed");
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
              sx={{ position: "absolute", top: "100%", left: 0, color: "red", fontSize: "11px", mt: "2px" }}
            >
              {errorSearch}
            </Typography>
          )}
        </Box>

        {/* Month Pickers */}
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
        </LocalizationProvider>

        <Button variant="contained" size="small" onClick={handleDownload} disabled={!searchQuery?.trim() && !startMonth}>
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
          // getRowId={(row) => `${row.emp_id}-${row.payroll_month}-${row.duration_month}`}\
          components={{
            NoRowsOverlay: () => (
              <GridOverlay>
                <Box sx={{ height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
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
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", p: 1 }}>
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
        <EmployeeModal employee={selectedEmployee} onClose={() => setModelOpen(false)} loading={loadingDetail} />
      )}
    </Box>
  );
};

export default DataTable;
