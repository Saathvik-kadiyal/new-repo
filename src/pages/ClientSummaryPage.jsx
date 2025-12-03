import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Collapse,
  IconButton,
} from "@mui/material";
import { ChevronDown, ChevronUp } from "lucide-react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { debounce, fetchClientComparison, fetchClients } from "../utils/helper";

const ClientSummaryPage = () => {
  const [searchBy, setSearchBy] = useState("");
  const [startMonth, setStartMonth] = useState(null);
  const [endMonth, setEndMonth] = useState(null);
  const [selectedClient, setSelectedClient] = useState("");
  const [clientsList, setClientsList] = useState([]);
  const [clientData, setClientData] = useState({});
  const [openDept, setOpenDept] = useState({});

  const debouncedFetch = useCallback(
    debounce(async (search, start, end, selectedClient) => {
      try {
        const res = await fetchClientComparison(
          search,
          start ? dayjs(start).format("YYYY-MM") : "",
          end ? dayjs(end).format("YYYY-MM") : "",
          selectedClient
        );
        setClientData(res);
      } catch (err) {
        console.log(err);
      }
    }, 600),
    []
  );

  useEffect(() => {
    const getClients = async () => {
      try {
        const res = await fetchClients();
        setClientsList(res.clients);
      } catch (err) {
        console.log(err);
      }
    };
    getClients();
  }, []);

  useEffect(() => {
    if (clientsList.length > 0) setSelectedClient(clientsList[0]);
  }, [clientsList]);

  useEffect(() => {
    if (!selectedClient) return;
    debouncedFetch(searchBy, startMonth, endMonth, selectedClient);
  }, [searchBy, startMonth, endMonth, selectedClient]);

  const handleClear = () => {
    setSearchBy("");
    setStartMonth(null);
    setEndMonth(null);
    setSelectedClient(clientsList[0]);
  };

  const toggleDept = (key) => {
    setOpenDept((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const colWidths = {
    dept: 280,
    headCount: 120,
    accountManager: 220,
    A: 80,
    B: 80,
    C: 80,
    PRIME: 80,
    total: 120,
  };

  const tableCellStyle = (width) => ({
    border: "1px solid #ccc",
    padding: "8px 12px",
    width,
    maxWidth: width,
    minWidth: width,
    color: "#000000",
  });

  const rightCellStyle = (width) => ({
    ...tableCellStyle(width),
    textAlign: "right",
  });

  const headerCellStyle = (width) => ({
    ...tableCellStyle(width),
    textAlign: "center",
    fontWeight: "bold",
    backgroundColor: "#000000",
    color: "#ffffff",
  });

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Client Summary
      </Typography>

      {/* -------------- SEARCH & SELECT SECTION -------------- */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 3,
          alignItems: "center",
        }}
      >
        <FormControl sx={{ width: 200, py: 0.5 }}>
          <InputLabel>Client</InputLabel>
          <Select
            value={selectedClient}
            label="Client"
            onChange={(e) => setSelectedClient(e.target.value)}
            size="small"
          >
            {clientsList.map((client) => (
              <MenuItem key={client} value={client}>
                {client}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Search by Account Manager"
          sx={{ width: 220 }}
          value={searchBy}
          onChange={(e) => setSearchBy(e.target.value)}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            views={["year", "month"]}
            label="Start Month"
            value={startMonth}
            onChange={(newValue) => setStartMonth(newValue)}
            slotProps={{ textField: { size: "small", sx: { width: 150 } } }}
          />
          <DatePicker
            views={["year", "month"]}
            label="End Month"
            value={endMonth}
            onChange={(newValue) => setEndMonth(newValue)}
            slotProps={{ textField: { size: "small", sx: { width: 150 } } }}
          />
        </LocalizationProvider>

        <Button variant="outlined" color="error" onClick={handleClear}>
          Clear
        </Button>
      </Box>

      {/* ----------------- HIERARCHY TABLE SECTION ----------------- */}
      {Object.entries(clientData)
        .filter(([month]) => month !== "horizontal_total")
        .map(([month, monthData], index) => {
          const formattedMonth = dayjs(month + "-01").format("MMM YYYY");
          const verticalTotals = monthData.vertical_total || {};
          const monthDiff = verticalTotals.month_total_diff ?? 0;

          return (
            <Box key={month} sx={{ mb: 4 }}>
              {/* Month title + difference */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Typography sx={{ mb: 2, fontWeight: "bold" }}>
                  {formattedMonth}
                </Typography>

                {index > 0 && (
                  <Typography
                    sx={{
                      mb: 2,
                      fontWeight: "bold",
                      color:
                        monthDiff > 0
                          ? "green"
                          : monthDiff < 0
                          ? "red"
                          : "black",
                    }}
                  >
                    Difference: {monthDiff}
                  </Typography>
                )}
              </Box>

              {/* Table */}
              <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellStyle(colWidths.dept)}>
                      Department
                    </TableCell>
                    <TableCell sx={headerCellStyle(colWidths.headCount)}>
                      Head Count
                    </TableCell>
                    <TableCell sx={headerCellStyle(colWidths.accountManager)}>
                      Account Manager
                    </TableCell>
                    <TableCell sx={headerCellStyle(colWidths.A)}>A</TableCell>
                    <TableCell sx={headerCellStyle(colWidths.B)}>B</TableCell>
                    <TableCell sx={headerCellStyle(colWidths.C)}>C</TableCell>
                    <TableCell sx={headerCellStyle(colWidths.PRIME)}>
                      PRIME
                    </TableCell>
                    <TableCell sx={headerCellStyle(colWidths.total)}>
                      Total Allowance
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {monthData.message ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        sx={{ textAlign: "center", fontStyle: "italic" }}
                      >
                        Data not present for this month
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {Object.entries(monthData)
                        .filter(([deptName, deptData]) => deptData.emp)
                        .map(([deptName, deptData]) => {
                          const key = `${month}-${deptName}`;
                          return (
                            <React.Fragment key={key}>
                              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell
                                  sx={{
                                    ...tableCellStyle(colWidths.dept),
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => toggleDept(key)}
                                >
                                  {deptName}
                                  {deptData.emp.length > 0 && (
                                    <IconButton
                                      size="small"
                                      onClick={() => toggleDept(key)}
                                      sx={{ ml: 2, verticalAlign: "middle" }}
                                    >
                                      {openDept[key] ? (
                                        <ChevronUp size={20} />
                                      ) : (
                                        <ChevronDown size={20} />
                                      )}
                                    </IconButton>
                                  )}
                                </TableCell>
                                <TableCell sx={rightCellStyle(colWidths.headCount)}>
                                  {deptData.head_count}
                                </TableCell>
                                <TableCell
                                  sx={rightCellStyle(colWidths.accountManager)}
                                >
                                  {deptData.emp?.length > 0
                                    ? [
                                        ...new Set(
                                          deptData.emp.map(
                                            (e) => e.account_manager
                                          )
                                        ),
                                      ].join(", ")
                                    : ""}
                                </TableCell>
                                <TableCell sx={rightCellStyle(colWidths.A)}>
                                  {deptData.dept_total_A}
                                </TableCell>
                                <TableCell sx={rightCellStyle(colWidths.B)}>
                                  {deptData.dept_total_B}
                                </TableCell>
                                <TableCell sx={rightCellStyle(colWidths.C)}>
                                  {deptData.dept_total_C}
                                </TableCell>
                                <TableCell sx={rightCellStyle(colWidths.PRIME)}>
                                  {deptData.dept_total_PRIME}
                                </TableCell>
                                <TableCell sx={rightCellStyle(colWidths.total)}>
                                  {deptData.total_allowance}
                                </TableCell>
                              </TableRow>

                              {/* EXPAND */}
                              <TableRow>
                                <TableCell colSpan={8} sx={{ padding: 0 }}>
                                  <Collapse
                                    in={openDept[key]}
                                    timeout="auto"
                                    unmountOnExit
                                  >
                                    <Table
                                      size="small"
                                      sx={{
                                        borderCollapse: "collapse",
                                        width: "100%",
                                      }}
                                    >
                                      <TableBody>
                                        {deptData.emp.map((emp) => (
                                          <TableRow
                                            key={emp.emp_id}
                                            sx={{ backgroundColor: "#ffffff" }}
                                          >
                                            <TableCell
                                              sx={{
                                                ...tableCellStyle(colWidths.dept),
                                                textAlign: "left",
                                                paddingLeft: 16,
                                              }}
                                            >
                                              {emp.emp_name}
                                            </TableCell>
                                            <TableCell
                                              sx={rightCellStyle(colWidths.headCount)}
                                            >
                                              1
                                            </TableCell>
                                            <TableCell
                                              sx={rightCellStyle(colWidths.accountManager)}
                                            >
                                              {emp.account_manager}
                                            </TableCell>
                                            <TableCell sx={rightCellStyle(colWidths.A)}>
                                              {emp.A}
                                            </TableCell>
                                            <TableCell sx={rightCellStyle(colWidths.B)}>
                                              {emp.B}
                                            </TableCell>
                                            <TableCell sx={rightCellStyle(colWidths.C)}>
                                              {emp.C}
                                            </TableCell>
                                            <TableCell
                                              sx={rightCellStyle(colWidths.PRIME)}
                                            >
                                              {emp.PRIME}
                                            </TableCell>
                                            <TableCell
                                              sx={rightCellStyle(colWidths.total)}
                                            >
                                              {emp.total_allowance}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          );
                        })}

                      {/* TOTAL ROW */}
                      <TableRow sx={{ backgroundColor: "#cfcfcf" }}>
                        <TableCell
                          sx={{
                            ...tableCellStyle(colWidths.dept),
                            fontWeight: "bold",
                          }}
                        >
                          Total
                        </TableCell>
                        <TableCell
                          sx={{
                            ...rightCellStyle(colWidths.headCount),
                            fontWeight: "bold",
                          }}
                        >
                          {verticalTotals.head_count}
                        </TableCell>
                        <TableCell sx={rightCellStyle(colWidths.accountManager)} />
                        <TableCell
                          sx={{
                            ...rightCellStyle(colWidths.A),
                            fontWeight: "bold",
                          }}
                        >
                          {verticalTotals.total_A}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...rightCellStyle(colWidths.B),
                            fontWeight: "bold",
                          }}
                        >
                          {verticalTotals.total_B}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...rightCellStyle(colWidths.C),
                            fontWeight: "bold",
                          }}
                        >
                          {verticalTotals.total_C}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...rightCellStyle(colWidths.PRIME),
                            fontWeight: "bold",
                          }}
                        >
                          {verticalTotals.total_PRIME}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...rightCellStyle(colWidths.total),
                            fontWeight: "bold",
                          }}
                        >
                          {verticalTotals.total_allowance}
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </Box>
          );
        })}
    </Box>
  );
};

export default ClientSummaryPage;
