import React, { useEffect, useState, useMemo, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Menu,
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
    rows,
    debouncedFetch,
    handlePageChange,
    handleIndividualEmployee,
    getProcessedData,
  } = useEmployeeData();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState("Emp ID");
  const firstRender = useRef(true);

  // Convert rows to DataGrid format
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
      ),cellClassName: "no-right-border",
    },
  ];

  const dataRows = rows.map((row, i) => ({
    id: row.id || i,
    ...row,
  }));

  // Search trigger
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (searchQuery.trim().length > 3) {
      debouncedFetch(searchQuery, searchBy, page - 1);
    } else if (searchQuery.trim().length === 0) {
      getProcessedData((page - 1) * 10, 10);
    }
  }, [searchQuery, searchBy, page]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Search */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Select
          size="small"
          value={searchBy}
          onChange={(e) => setSearchBy(e.target.value)}
        >
          <MenuItem value="Emp ID">Emp ID</MenuItem>
          <MenuItem value="Account Manager">Account Manager</MenuItem>
        </Select>

        <TextField
          size="small"
          placeholder={`Search by ${searchBy}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      <Box
        sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
      >
        <DataGrid
          key={{}}
          rows={dataRows}
          columns={columns}
          disableRowSelectionOnClick
          disableColumnReorder
          pagination={false}
          hideFooter
          autoHeight={false}
          onRowClick={(params) => {
            console.log(params.row["Emp ID"]);
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

      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            p: 1,
          }}
        >
          <Button
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
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
