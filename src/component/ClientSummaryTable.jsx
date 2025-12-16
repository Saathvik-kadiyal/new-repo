import React, { useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, IconButton, Typography } from "@mui/material";
import { ChevronDown } from "lucide-react";


const formatINR = (value) => {
  if (value == null) return "";
  return `₹${Number(value).toLocaleString("en-IN")}`;
};


const ClientSummaryTable = ({
  clientsMap,
  monthTotals,
  monthTotalA,
  monthTotalB,
  monthTotalC,
  monthTotalPRIME,
}) => {
  const [openMap, setOpenMap] = useState({});

  const toggleOpen = (key) => {
    setOpenMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const columns = [
    {
      field: "clientName",
      headerName: "Client",
      width: 340,
      renderCell: (params) => {
        const { row } = params;
        const isExpandable = row.level < 2;

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              pl: row.level * 2,
              scrollBehavior: "smooth",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
            onClick={() => toggleOpen(row.clientKey)}
          >
            {!isExpandable && <Box sx={{ width: 28 }} />}
            {params.value}
            {isExpandable && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOpen(row.clientKey);
                }}
              >
                <ChevronDown
                  size={16}
                  style={{
                    transform: openMap[row.clientKey]
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "0.3s",
                  }}
                />
              </IconButton>
            )}
          </Box>
        );
      },
    },
    { field: "headCount", headerName: "Head Count", width: 120 },
    { field: "accountManager", headerName: "Client Partner", width: 200 },
    { field: "shiftA", headerName: "Shift A", width: 150 },
    { field: "shiftB", headerName: "Shift B", width: 150 },
    { field: "shiftC", headerName: "Shift C", width: 150 },
    { field: "primeShift", headerName: "PRIME", width: 150 },
    { field: "amount", headerName: "Total Allowance", width: 160 },
  ];

  const rows = useMemo(() => {
    const flatRows = [];

    Object.entries(clientsMap || {})
      .filter(([name]) => name !== "total" && name !== "month_total")
      .forEach(([clientName, clientObj]) => {
        console.log(clientObj.client_head_count)
        const clientKey = clientName;
        flatRows.push({
          id: clientKey,
          clientKey,
          clientName,
          level: 0,
          headCount: clientObj.client_head_count ?? "",
          accountManager: clientObj.client_partner ?? "",
          shiftA: formatINR(clientObj.client_A ?? 0) ,
          shiftB: formatINR(clientObj.client_B ?? 0),
          shiftC: formatINR(clientObj.client_C ?? 0),
          primeShift: formatINR(clientObj.client_PRIME ?? 0),
          amount: formatINR(clientObj.client_total ?? 0),
        });

        if (openMap[clientKey]) {
          Object.entries(clientObj?.departments || {}).forEach(
            ([deptName, deptObj]) => {
              const deptKey = `${clientKey}-${deptName}`;

              flatRows.push({
                id: deptKey,
                clientKey: deptKey,
                clientName: deptName,
                level: 1,
                headCount: deptObj.dept_head_count ?? 0,
                accountManager: deptObj.account_manager ?? "",
                shiftA: formatINR(deptObj.dept_A ?? 0),
                shiftB: formatINR(deptObj.dept_B ?? 0),
                shiftC: formatINR(deptObj.dept_C ?? 0),
                primeShift: formatINR(deptObj.dept_PRIME ?? 0),
                amount: formatINR(deptObj.dept_total ?? 0),
              });

              if (openMap[deptKey]) {
                (deptObj.employees || []).forEach((emp) => {
                  flatRows.push({
                    id: `${deptKey}-emp-${emp.emp_id}`,
                    clientKey: `${deptKey}-emp-${emp.emp_id}`,
                    clientName: emp.emp_name,
                    level: 2,
                    headCount: 1,
                    accountManager: emp.account_manager ?? "",
                    shiftA: formatINR(emp.A ?? 0),
                    shiftB: formatINR(emp.B ?? 0),
                    shiftC: formatINR(emp. C?? 0),
                    primeShift: formatINR(emp. PRIME?? 0),
                    amount: formatINR(emp. total?? 0),
                  });
                });
              }
            }
          );
        }
      });

    const monthTotalRow = {
      id: "monthTotal",
      clientKey: "monthTotal",
      clientName: "Month Total",
      headCount: monthTotals?.total_head_count ?? "",
      shiftA: `₹${monthTotalA ?? 0}`,
      shiftB: `₹${monthTotalB ?? 0}`,
      shiftC: `₹${monthTotalC ?? 0}`,
      primeShift: `₹${monthTotalPRIME ?? 0}`,
      amount: `₹${monthTotals?.total_allowance ?? ""}`,
    };

    flatRows.push(monthTotalRow);

    return flatRows;
  }, [clientsMap, openMap, monthTotals, monthTotalA, monthTotalB, monthTotalC, monthTotalPRIME]);

  return (
    <Box sx={{  }}>
      { (Object.keys(clientsMap).length === 0 || clientsMap?.message) ?(
         <Box sx={{ p: 2 }}>
              <Typography color="error">{clientsMap.message || "No Data Found"}</Typography>
            </Box>
      ):(
        <DataGrid
        rows={rows}
        columns={columns}
        pagination={false}
        hideFooter
        disableRowSelectionOnClick
        disableColumnReorder
        disableColumnSorting
        getRowId={(row) => row.id}
        getRowClassName={(params) => {
              if (params.row.id === "monthTotal") {
      return "row-month-total";
    }
          if (params.row.level === 1) return "row-department";
          if (params.row.level === 2) return "row-employee";
          return "row-client";
        }}
        sx={{
          border: "none",
          borderRadius: 0,
          ".row-month-total":{
backgroundColor: "#d1eaff",
fontWeight: 700,
          },

          "& .row-client": {
            backgroundColor: "#e9f5ff",
            fontWeight: 600,
          },
          "& .row-department": {
            backgroundColor: "#f0f4ff",
          },
          "& .row-employee": {
            backgroundColor: "#fafafa",
          },
          "& .MuiDataGrid-cell": {
            outline: "none",
            cursor: "pointer",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#000",
            color: "#fff",
          },
          "& .MuiDataGrid-columnHeaderTitleContainer": {
            backgroundColor: "#000",
            borderRadius: "none",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 700,
            textAlign: "center",
            backgroundColor: "#000",
            color: "#fff",
          },
          "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
            outline: "none",
          },
          "& .MuiDataGrid-root": {
            "&::-webkit-scrollbar": {
              display: "none",
            },
          },
        }}
      />
      )}
    </Box>
  );
};

export default ClientSummaryTable;
