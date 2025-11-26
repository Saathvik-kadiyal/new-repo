import React, { useEffect, useState, useRef } from "react";
import { DataGrid, GridOverlay } from "@mui/x-data-grid";
import {
  MenuItem,
  Select,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";

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
    displayRows, // <- use displayRows here
    debouncedFetch,
    handlePageChange,
    handleIndividualEmployee,
    getProcessedData,
    downloadSearchData, // <- make sure it's here
  } = useEmployeeData();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState("Emp ID");
  const [errorSearch, setErrorSearch] = useState("");
 const pattern = /^[A-Za-z]{2}[A-Za-z0-9-_ ]*$/;


  const firstRender = useRef(true);

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
      sortable: false,
      flex: 0.5,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            handleIndividualEmployee(params.row["Emp ID"]);
            setModelOpen(true);
          }}
        >
          View
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
      debouncedFetch(searchQuery, searchBy);
    } else if (searchQuery.trim().length === 0) {
      getProcessedData((page - 1) * 10, 10);
    }
  }, [searchQuery, searchBy, page, errorSearch]);

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Search Box */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
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

        {searchQuery.trim().length > 0 && (
          <Button
            variant="contained"
            size="small"
            onClick={() =>
              downloadSearchData({ query: searchQuery.trim(), searchBy })
            }
          >
            Download Search Data
          </Button>
        )}
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
  getRowId={(row) => row.emp_id} // <-- Use emp_id as the unique id
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
          <Button
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
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
