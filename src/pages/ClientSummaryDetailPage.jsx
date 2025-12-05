import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  CircularProgress,
} from "@mui/material";
import { ChevronDown, ChevronUp } from "lucide-react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { debounce, fetchClients, fetchClientSummary } from "../utils/helper";

const ClientSummaryDetailedPage = () => {
  const [client, setClient] = useState("ALL");
  const [startMonth, setStartMonth] = useState(null);
  const [endMonth, setEndMonth] = useState(null);
  const [search, setSearch] = useState("");
  const [amSearch, setAmSearch] = useState("");
  const [selectedAM, setSelectedAM] = useState("");
  const [clientsList, setClientsList] = useState([]);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openMap, setOpenMap] = useState({});

  const token = localStorage.getItem("access_token");

  const colWidths = {
    label: 300,
    headCount: 120,
    accountManager: 220,
    A: 100,
    B: 100,
    C: 100,
    PRIME: 100,
    amount: 120,
  };

  const tableCellStyle = (width) => ({
    border: "1px solid #ccc",
    padding: "8px 10px",
    width,
    maxWidth: width,
    minWidth: width,
    color: "#000000",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  });

  const rightCellStyle = (width) => ({
    ...tableCellStyle(width),
    textAlign: "right",
  });

  const headerCellStyle = (width, align = "center") => ({
    ...tableCellStyle(width),
    textAlign: align,
    fontWeight: "bold",
    backgroundColor: "#000000",
    color: "#ffffff",
  });

  const labelCellStyle = (indent = 0) => ({
    ...tableCellStyle(colWidths.label),
    paddingLeft: 2 + indent,
    fontWeight: "bold",
    cursor: "pointer",
  });

  const toggleOpen = (key) =>
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));

  const runFetch = useCallback(
    debounce(async (token, clientVal, start, end, am) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchClientSummary(
          token,
          clientVal || "ALL",
          am || "",
          start ? dayjs(start).format("YYYY-MM") : "",
          end ? dayjs(end).format("YYYY-MM") : ""
        );
        setData(res || {});
      } catch (err) {
        setError(err?.message || "Unable to fetch data");
        setData({});
      } finally {
        setLoading(false);
      }
    }, 600),
    []
  );

  useEffect(() => {
    let mounted = true;
    const getClients = async () => {
      try {
        const res = await fetchClients();
        if (!mounted) return;
        const list = Array.isArray(res?.clients)
          ? ["ALL", ...res.clients]
          : ["ALL"];
        setClientsList(list);
        if (!client && list.length > 0) setClient(list[0]);
      } catch (err) {
        console.error(err);
      }
    };
    getClients();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    runFetch(token, client, startMonth, endMonth, selectedAM);
  }, [client, startMonth, endMonth, selectedAM, runFetch]);

  const accountManagerList = useMemo(() => {
    const setAM = new Set();
    Object.values(data).forEach((monthObj) => {
      if (!monthObj) return;
      if (monthObj.clients && typeof monthObj.clients === "object") {
        Object.values(monthObj.clients).forEach((clientObj) => {
          const deps = clientObj.departments || {};
          Object.values(deps).forEach((dept) => {
            (dept.employees || []).forEach((e) => {
              if (e.account_manager) setAM.add(e.account_manager);
            });
          });
        });
      }
    });
    return Array.from(setAM).sort();
  }, [data]);

  const filteredAMs = useMemo(() => {
    return accountManagerList.filter((am) =>
      am.toLowerCase().includes(amSearch.toLowerCase())
    );
  }, [amSearch, accountManagerList]);

  const matchesSearch = (txt) =>
    !search ||
    ("" + (txt ?? "")).toLowerCase().includes(search.trim().toLowerCase());

  const monthKeys = useMemo(() => {
    return Object.keys(data)
      .filter((k) => k !== "total" && k !== "horizontal_total")
      .sort();
  }, [data]);

  let prevTotal = null;

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Client Summary
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 3,
          alignItems: "center",
        }}
      >
        <FormControl sx={{ width: 200 }}>
          <InputLabel>Client</InputLabel>
          <Select
            value={client}
            label="Client"
            size="small"
            onChange={(e) => setClient(e.target.value)}
          >
            {clientsList.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ width: 240, position: "relative" }}>
          <TextField
            size="small"
            placeholder="Search Account Manager"
            value={selectedAM || amSearch}
            onChange={(e) => {
              setAmSearch(e.target.value);
              setSelectedAM("");
            }}
            sx={{ width: "100%" }}
          />
          {amSearch && filteredAMs.length > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                bgcolor: "white",
                border: "1px solid #ccc",
                maxHeight: 200,
                overflowY: "auto",
                zIndex: 10,
              }}
            >
              {filteredAMs.map((am) => (
                <Box
                  key={am}
                  sx={{
                    px: 1,
                    py: 0.5,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#f0f0f0" },
                  }}
                  onClick={() => {
                    setSelectedAM(am);
                    setAmSearch("");
                  }}
                >
                  {am}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            views={["year", "month"]}
            label="Start Month"
            value={startMonth}
            onChange={(v) => setStartMonth(v)}
            disableFuture
            slotProps={{ textField: { size: "small", sx: { width: 150 } } }}
          />
          <DatePicker
            views={["year", "month"]}
            label="End Month"
            value={endMonth}
            disableFuture
            onChange={(v) => setEndMonth(v)}
            slotProps={{ textField: { size: "small", sx: { width: 150 } } }}
          />
        </LocalizationProvider>

        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            setClient("ALL");
            setSelectedAM("");
            setStartMonth(null);
            setEndMonth(null);
            setSearch("");
            setAmSearch("");
          }}
        >
          Clear
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Loading...</Typography>
        </Box>
      )}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {!loading && monthKeys.length === 0 && !data?.total && (
        <Typography sx={{ fontStyle: "italic" }}>No data found</Typography>
      )}

      {monthKeys.map((monthKey) => {
        const monthObj = data[monthKey];
        const formattedMonth = dayjs(monthKey + "-01").format("MMM YYYY");
        const clientsMap = monthObj?.clients || monthObj || {};
        

        const monthTotals = {
  total_head_count: 0,
  A: 0,
  B: 0,
  C: 0,
  PRIME: 0,
  total_allowance: 0,
};

Object.values(clientsMap).forEach((client) => {
  monthTotals.total_head_count += client.client_head_count ?? 0;
  monthTotals.total_allowance += client.client_total ?? 0;
  monthTotals.A += client.client_A ?? 0;
  monthTotals.B += client.client_B ?? 0;
  monthTotals.C += client.client_C ?? 0;
  monthTotals.PRIME += client.client_PRIME ?? 0;
});
const monthTotalAmount = monthTotals?.total_allowance ?? 0;

        const diff = prevTotal !== null ? monthTotalAmount - prevTotal : 0;

        if (!monthObj || monthObj?.message === "No data found") {
  return (
    <Box key={monthKey} sx={{ mb: 4 }}>
      <Typography sx={{ fontWeight: "bold", mb: 1 }}>
        {formattedMonth}
      </Typography>
      <Box
        sx={{
          p: 2,
          bgcolor: "#fff7e0",
          border: "1px solid #e6d18b",
          borderRadius: 1,
        }}
      >
        <Typography sx={{ fontStyle: "italic" }}>
          No data available for this month.
        </Typography>
      </Box>
    </Box>
  );
}

        let diffColor = "black";
        if (prevTotal !== null) {
          if (diff > 0) diffColor = "red";
          else if (diff < 0) diffColor = "green";
        }

        prevTotal = monthTotalAmount;

        return (
          <Box key={monthKey} sx={{ mb: 4 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography sx={{ fontWeight: "bold" }}>
                {formattedMonth}
              </Typography>
              <Typography sx={{ fontWeight: "bold", color: diffColor }}>
                Headcount: {monthTotals?.total_head_count ?? "-"} — Total:
                &#x20B9;{monthTotalAmount}{" "}
                {prevTotal !== null ? `(${diff >= 0 ? "+" : ""}${diff})` : ""}
              </Typography>
            </Box>

            <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellStyle(colWidths.label)}>
                    Client
                  </TableCell>
                  <TableCell sx={headerCellStyle(colWidths.headCount)}>
                    Head Count
                  </TableCell>
                  <TableCell sx={headerCellStyle(colWidths.accountManager)}>
                    Client Partner
                  </TableCell>
                  <TableCell sx={headerCellStyle(colWidths.A)}>A<br/><span className="text-[9px]">(09 PM to 06 AM)</span></TableCell>
                  <TableCell sx={headerCellStyle(colWidths.B)}>B<br/><span className="text-[9px]">(04 PM to 01 AM)</span></TableCell>
                  <TableCell sx={headerCellStyle(colWidths.C)}>C<br/><span className="text-[9px]">(06 AM to 03 PM)</span></TableCell>
                  <TableCell sx={headerCellStyle(colWidths.PRIME)}>
                    PRIME<br/><span className="text-[9px]">(12 AM to 09 AM)</span>
                  </TableCell>
                  <TableCell sx={headerCellStyle(colWidths.amount)}>
                    Amount
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(clientsMap)
                  .filter(
                    ([clientName]) =>
                      clientName !== "month_total" && clientName !== "total"
                  )
                  .filter(([clientName]) => matchesSearch(clientName))
                  .map(([clientName, clientObj]) => {
                    const clientKey = `${monthKey}-client-${clientName}`;
                    const departments = clientObj?.departments || {};
                    const clientHeadCount =
                      clientObj?.client_head_count ??
                      clientObj?.client_headcount;
                    const clientTotal =
                      clientObj?.client_total ??
                      clientObj?.client_total_allowance ??
                      "-";

                    return (
                      <React.Fragment key={clientKey}>
                        {/* Client Row */}
                        <TableRow sx={{ backgroundColor: "#e9f5ff" }}>
                          <TableCell
                            sx={labelCellStyle(0)}
                            onClick={() => toggleOpen(clientKey)}
                          >
                            {clientName}
                            <IconButton size="small" sx={{ ml: 1 }}>
                              {openMap[clientKey] ? (
                                <ChevronUp />
                              ) : (
                                <ChevronDown />
                              )}
                            </IconButton>
                          </TableCell>
                          <TableCell sx={rightCellStyle(colWidths.headCount)}>
                            {clientHeadCount ?? "-"}
                          </TableCell>
                          <TableCell
                            sx={tableCellStyle(colWidths.accountManager)}
                          />
                          <TableCell sx={rightCellStyle(colWidths.A)}>
                            &#x20B9;{clientObj?.client_A ?? 0}
                          </TableCell>
                          <TableCell sx={rightCellStyle(colWidths.B)}>
                            &#x20B9;{clientObj?.client_B ?? 0}
                          </TableCell>
                          <TableCell sx={rightCellStyle(colWidths.C)}>
                            &#x20B9;{clientObj?.client_C ?? 0}
                          </TableCell>
                          <TableCell sx={rightCellStyle(colWidths.PRIME)}>
                            &#x20B9;{clientObj?.client_PRIME ?? 0}
                          </TableCell>
                          <TableCell sx={rightCellStyle(colWidths.amount)}>
                            &#x20B9;{clientTotal}
                          </TableCell>
                        </TableRow>

                        {/* Department Rows */}
                        {openMap[clientKey] &&
                          Object.entries(departments)
                            .filter(([deptName]) => matchesSearch(deptName))
                            .map(([deptName, deptObj]) => {
                              const deptKey = `${clientKey}-dept-${deptName}`;
                              const deptHeadCount =
                                deptObj?.dept_head_count ??
                                (deptObj.employees
                                  ? deptObj.employees.length
                                  : 0);
                              const deptTotal =
                                deptObj?.dept_total ??
                                deptObj?.dept_total_amount ??
                                0;

                              return (
                                <React.Fragment key={deptKey}>
                                  <TableRow sx={{ backgroundColor: "#f5f7ff" }}>
                                    <TableCell
                                      sx={labelCellStyle(2)}
                                      onClick={() => toggleOpen(deptKey)}
                                    >
                                      {deptName}
                                      <IconButton size="small" sx={{ ml: 1 }}>
                                        {openMap[deptKey] ? (
                                          <ChevronUp />
                                        ) : (
                                          <ChevronDown />
                                        )}
                                      </IconButton>
                                    </TableCell>
                                    <TableCell
                                      sx={rightCellStyle(colWidths.headCount)}
                                    >
                                      {deptHeadCount}
                                    </TableCell>
                                    <TableCell
                                      sx={tableCellStyle(
                                        colWidths.accountManager
                                      )}
                                    />
                                    <TableCell sx={rightCellStyle(colWidths.A)}>
                                      {deptObj?.A }
                                    </TableCell>
                                    <TableCell sx={rightCellStyle(colWidths.B)}>
                                      {deptObj?.B}
                                    </TableCell>
                                    <TableCell sx={rightCellStyle(colWidths.C)}>
                                      {deptObj?.C}
                                    </TableCell>
                                    <TableCell
                                      sx={rightCellStyle(colWidths.PRIME)}
                                    >
                                      {deptObj?.PRIME}
                                    </TableCell>
                                    <TableCell
                                      sx={rightCellStyle(colWidths.amount)}
                                    >
                                      &#x20B9;{deptTotal}
                                    </TableCell>
                                  </TableRow>

                                  {/* Employee Rows */}
                                  {openMap[deptKey] &&
                                    (deptObj.employees || [])
                                      .filter(
                                        (emp) =>
                                          !selectedAM ||
                                          emp.account_manager === selectedAM
                                      )
                                      .filter(
                                        (emp) =>
                                          matchesSearch(emp.emp_name) ||
                                          matchesSearch(emp.emp_id)
                                      )
                                      .map((emp) => {
                                        const empKey = `${deptKey}-emp-${emp.emp_id}`;
                                        const empTotal =
                                          emp.total ??
                                          emp.total_allowance ??
                                          (emp.A ?? 0) +
                                            (emp.B ?? 0) +
                                            (emp.C ?? 0) +
                                            (emp.PRIME ?? 0);

                                        return (
                                          <React.Fragment key={empKey}>
                                            <TableRow
                                              sx={{
                                                backgroundColor: "#fffff",
                                              }}
                                            >
                                              <TableCell
                                                sx={{
                                                  ...labelCellStyle(4),
                                                  fontWeight: "normal",
                                                }}
                                              >
                                                {emp.emp_name}
                                              </TableCell>
                                              <TableCell
                                                sx={rightCellStyle(
                                                  colWidths.headCount
                                                )}
                                              >
                                                1
                                              </TableCell>
                                              <TableCell
                                                sx={tableCellStyle(
                                                  colWidths.accountManager
                                                )}
                                              >
                                                {emp.account_manager}
                                              </TableCell>
                                              <TableCell
                                                sx={rightCellStyle(colWidths.A)}
                                              >
                                                &#x20B9;{emp.A ?? 0}
                                              </TableCell>
                                              <TableCell
                                                sx={rightCellStyle(colWidths.B)}
                                              >
                                                &#x20B9;{emp.B ?? 0}
                                              </TableCell>
                                              <TableCell
                                                sx={rightCellStyle(colWidths.C)}
                                              >
                                                &#x20B9;{emp.C ?? 0}
                                              </TableCell>
                                              <TableCell
                                                sx={rightCellStyle(
                                                  colWidths.PRIME
                                                )}
                                              >
                                                &#x20B9;{emp.PRIME ?? 0}
                                              </TableCell>
                                              <TableCell
                                                sx={rightCellStyle(
                                                  colWidths.amount
                                                )}
                                              >
                                                &#x20B9;{empTotal}
                                              </TableCell>
                                            </TableRow>
                                          </React.Fragment>
                                        );
                                      })}
                                </React.Fragment>
                              );
                            })}
                      </React.Fragment>
                    );
                  })}

                {/* Month Total */}
              <TableRow sx={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}>
  <TableCell sx={tableCellStyle(colWidths.label)}>Month Total</TableCell>
  <TableCell sx={rightCellStyle(colWidths.headCount)}>
    {monthTotals.total_head_count}
  </TableCell>
  <TableCell sx={tableCellStyle(colWidths.accountManager)} />
  <TableCell sx={rightCellStyle(colWidths.A)}>&#x20B9;{monthTotals.A}</TableCell>
  <TableCell sx={rightCellStyle(colWidths.B)}>&#x20B9;{monthTotals.B}</TableCell>
  <TableCell sx={rightCellStyle(colWidths.C)}>&#x20B9;{monthTotals.C}</TableCell>
  <TableCell sx={rightCellStyle(colWidths.PRIME)}>&#x20B9;{monthTotals.PRIME}</TableCell>
  <TableCell sx={rightCellStyle(colWidths.amount)}>
    &#x20B9;{monthTotals.total_allowance}
  </TableCell>
</TableRow>
              </TableBody>
            </Table>
          </Box>
        );
      })}
    </Box>
  );
};

export default ClientSummaryDetailedPage;
