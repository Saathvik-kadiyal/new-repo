import { useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  IconButton,
  Popover,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import { ChevronDown, EllipsisVertical, Info } from "lucide-react";

const formatINR = (value) =>
  value == null ? "" : `₹${Number(value).toLocaleString("en-IN")}`;
const parseINR = (value) =>
  !value ? 0 : Number(String(value).replace(/[₹,]/g, ""));

const AccountManagerTable = ({ data = [], clickedClient }) => {
  const [openMap, setOpenMap] = useState({});
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverMessage, setPopoverMessage] = useState("");
  const [sortAnchor, setSortAnchor] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  const toggleOpen = (key) =>
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
  const handleInfoClick = (event, message) => {
    setPopoverAnchor(event.currentTarget);
    setPopoverMessage(message);
  };
  const handlePopoverClose = () => {
    setPopoverAnchor(null);
    setPopoverMessage("");
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 300,
      renderCell: (params) => {
        const { row } = params;
        const paddingLeft = row.level * 6;
        const canExpand = row.level < 2;

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              pl: paddingLeft,
              transition: "all 0.3s ease",
            }}
            onClick={() => canExpand && toggleOpen(row.key)}
          >
            {params.value}

            {canExpand && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOpen(row.key);
                }}
              >
                <ChevronDown
                  size={16}
                  style={{
                    transform: openMap[row.key]
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "0.3s",
                  }}
                />
              </IconButton>
            )}

            {row.error && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleInfoClick(e, row.error);
                }}
              >
                <Info size={16} />
              </IconButton>
            )}
          </Box>
        );
      },
    },
    { field: "headCount", headerName: "Head Count", width: 120 },
    { field: "shiftA", headerName: "Shift A", width: 150 },
    { field: "shiftB", headerName: "Shift B", width: 150 },
    { field: "shiftC", headerName: "Shift C", width: 150 },
    { field: "shiftPRIME", headerName: "PRIME", width: 150 },
    {
      field: "totalAllowance",
      headerName: "Total Allowance",
      width: 180,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography fontWeight={700}>Total Allowance</Typography>
          <IconButton
            size="small"
            sx={{ color: "#fff" }}
            onClick={(e) => setSortAnchor(e.currentTarget)}
          >
            <EllipsisVertical color="white" fontSize="small" />
          </IconButton>

          <Menu
            anchorEl={sortAnchor}
            open={Boolean(sortAnchor)}
            onClose={() => setSortAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                setSortOrder("desc");
                setSortAnchor(null);
              }}
            >
              High → Low
            </MenuItem>
            <MenuItem
              onClick={() => {
                setSortOrder("asc");
                setSortAnchor(null);
              }}
            >
              Low → High
            </MenuItem>
            <MenuItem
              onClick={() => {
                setSortOrder(null);
                setSortAnchor(null);
              }}
            >
              Clear Sort
            </MenuItem>
          </Menu>
        </Box>
      ),
    },
  ];

  const rows = useMemo(() => {
    const flatRows = [];

    data.forEach((manager) => {
      const managerKey = `manager-${manager.manager_name}`;
      flatRows.push({
        key: managerKey,
        id: managerKey,
        name: manager.manager_name,
        level: 0,
        headCount: manager.head_count,
        shiftA: formatINR(manager.shifts.shift_A.total),
        shiftB: formatINR(manager.shifts.shift_B.total),
        shiftC: formatINR(manager.shifts.shift_C.total),
        shiftPRIME: formatINR(manager.shifts.shift_PRIME.total),
        totalAllowance: formatINR(manager.total_allowance),
        clients: manager.clients,
      });

      if (openMap[managerKey]) {
        manager.clients.forEach((client) => {
          const clientKey = `${managerKey}-client-${client.client_name}`;
          flatRows.push({
            key: clientKey,
            id: clientKey,
            name: client.client_name,
            level: 1,
            headCount: client.head_count,
            shiftA: formatINR(client.shifts.shift_A.total),
            shiftB: formatINR(client.shifts.shift_B.total),
            shiftC: formatINR(client.shifts.shift_C.total),
            shiftPRIME: formatINR(client.shifts.shift_PRIME.total),
            totalAllowance: formatINR(client.total_allowance),
            parentKey: managerKey,
          });

          if (openMap[clientKey]) {
            client.departments.forEach((dept) => {
              const deptKey = `${clientKey}-dept-${dept.department_name}`;
              flatRows.push({
                key: deptKey,
                id: deptKey,
                name: dept.department_name,
                level: 2,
                headCount: dept.head_count,
                shiftA: formatINR(dept.shifts.shift_A.total),
                shiftB: formatINR(dept.shifts.shift_B.total),
                shiftC: formatINR(dept.shifts.shift_C.total),
                shiftPRIME: formatINR(dept.shifts.shift_PRIME.total),
                totalAllowance: formatINR(dept.total_allowance),
                parentKey: client.client_name,
              });
            });
          }
        });
      }
    });

    if (sortOrder) {
      flatRows.sort((a, b) => {
        const aVal = parseINR(a.totalAllowance);
        const bVal = parseINR(b.totalAllowance);
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return flatRows;
  }, [data, openMap, sortOrder]);

  return (
    <Box
      sx={{
        height: 600,
        borderRadius: 0,
        overflow: "auto",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        hideFooter
        disableColumnFilter
        disableColumnMenu
        disableColumnSelector
        disableColumnSorting
        getRowId={(row) => row.key}
        getRowClassName={(params) => {
          const row = params.row;
          if (row.level === 0) {
            const hasSelectedClient = row.clients?.some(
              (c) => c.client_name === clickedClient
            );
            return hasSelectedClient ? "row-manager-selected" : "row-manager";
          }
          if (row.level === 1) {
            return row.name === clickedClient
              ? "row-client-selected"
              : "row-client";
          }
          if (row.level === 2) {
            return row.parentKey === clickedClient
              ? "row-department-selected"
              : "row-department";
          }
          return "";
        }}
        sx={{
          border: "none",
          "& .MuiDataGrid-scrollbar--vertical": {
            display: "none",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#000",
            color: "#fff",
          },
          "& .MuiDataGrid-columnHeaders": {
            position: "sticky",
            top: 0,
            zIndex: 1,
          },
          "& .row-manager": { backgroundColor: "#e9f5ff", fontWeight: 600 },
          "& .row-client": { backgroundColor: "#f0f4ff" },
          "& .row-department": { backgroundColor: "#fafafa" },
          "& .row-manager-selected": {
            backgroundColor: "oklch(75% 0.183 55.934)",
            fontWeight: 700,
          },
          "& .row-client-selected": {
            backgroundColor: "oklch(87.9% 0.169 91.605)",
          },
          "& .row-department-selected": {
            backgroundColor: "oklch(94.5% 0.129 101.54)",
          },
          "& .MuiDataGrid-cell": { outline: "none", cursor: "pointer" },
        }}
      />

      <Popover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="body2">{popoverMessage}</Typography>
        </Box>
      </Popover>
    </Box>
  );
};

export default AccountManagerTable;
