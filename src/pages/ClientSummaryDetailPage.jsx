import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
  OutlinedInput,
  Checkbox,
  ListItemText,
  FormControlLabel,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormHelperText,
} from "@mui/material";
import { ChevronDown } from "lucide-react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import {
  debounce,
  fetchClientDepartments,
  fetchClientSummary,
} from "../utils/helper";
import ClientSummaryTable from "../component/ClientSummaryTable";

const ClientSummaryDetailedPage = () => {
  const [selectedClients, setSelectedClients] = useState([]);
  const [clientDepartments, setClientDepartments] = useState([]);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [expandedClient, setExpandedClient] = useState(null);
  const [startMonth, setStartMonth] = useState(null);
  const [endMonth, setEndMonth] = useState(null);
  const [search, setSearch] = useState("");
  const [amSearch, setAmSearch] = useState("");
  const [selectedAM, setSelectedAM] = useState("");
  const [timelineSelection, setTimelineSelection] = useState("range");
  const [year, setYear] = useState(null);
  const [multipleMonths, setMultipleMonths] = useState([]);
  const [quarterlySelection, setQuarterlySelection] = useState([]);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openMap, setOpenMap] = useState({});
  const [expandedMonth, setExpandedMonth] = useState([]);

  const token = localStorage.getItem("access_token");

  const timelines = [
    { label: "Monthly", value: "monthly" },
    { label: "Quarterly", value: "quarterly" },
    { label: "Range", value: "range" },
  ];

  const monthsList = [
    { label: "January", value: "01" },
    { label: "February", value: "02" },
    { label: "March", value: "03" },
    { label: "April", value: "04" },
    { label: "May", value: "05" },
    { label: "June", value: "06" },
    { label: "July", value: "07" },
    { label: "August", value: "08" },
    { label: "September", value: "09" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ];

  const quarterlyList = [
    { label: "Q1 (Jan - Mar)", value: "Q1" },
    { label: "Q2 (Apr - Jun)", value: "Q2" },
    { label: "Q3 (Jul - Sep)", value: "Q3" },
    { label: "Q4 (Oct - Dec)", value: "Q4" },
  ];


  const runFetch = useCallback(
    debounce(async (token, payload) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchClientSummary(payload);
        setData(res);
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
    const loadClientDepartments = async () => {
      try {
        setLoading(true);
        const data = await fetchClientDepartments();
        setClientDepartments(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadClientDepartments();
  }, []);

const toggleDepartment = (client, dept) => {
  setSelectedClients((prev) => {
    const current = prev[client] || [];
    if (dept === "ALL") {
      const allDepartments = clientDepartments.find((c) => c.client === client)?.departments || [];

      if (current.length === allDepartments.length) {
        const updatedState = { ...prev };
        delete updatedState[client];
        return updatedState;
      } else {
        return { ...prev, [client]: [...allDepartments] };
      }
    } else {
      const newDepartments = current.includes(dept)
        ? current.filter((d) => d !== dept)
        : [...current, dept];

      if (newDepartments.length === 0) {
        const updatedState = { ...prev };
        delete updatedState[client];
        return updatedState;
      }

      return { ...prev, [client]: newDepartments };
    }
  });
};


console.log(data)  
  useEffect(() => {
    let payload = {
      clients: "ALL",
    };
    runFetch(token, payload);
  }, []);

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

  const handleClientSummaryWithDepartments = () => {
    const payload = {
      clients:
        Object.keys(selectedClients).length > 0 ? selectedClients : "ALL",
    };
    console.log(payload);
    if (timelineSelection === "range") {
      if (startMonth) {
        payload.start_month = dayjs(startMonth).format("YYYY-MM");
      }
      if (endMonth) {
        payload.end_month = dayjs(endMonth).format("YYYY-MM");
      }
    }

    if (timelineSelection === "monthly") {
      if (year) {
        payload.selected_year = dayjs(year).format("YYYY");
      }
      if (multipleMonths?.length > 0) {
        payload.selected_months = multipleMonths;
      }
    }
    if (timelineSelection === "quarterly") {
      if (year) {
        payload.selected_year = dayjs(year).format("YYYY");
      }
      if (quarterlySelection?.length > 0) {
        payload.selected_quarters = quarterlySelection;
      }
    }

    if (selectedAM) {
      payload.account_manager = selectedAM;
    }

    runFetch(token, payload);
    setClientDialogOpen(false);
  };

  const formatMonthKey = (monthKey) => {
    if (!monthKey) return "";
    if (monthKey.includes(" - ")) {
      const [start, end] = monthKey.split(" - ");
let first = start.split("-")[1];
let last = end.split("-")[1];
      let quarter = "";
      if(first==="01" && last==="03") quarter="Q1";
      else if(first==="04" && last==="06") quarter="Q2";
      else if(first==="07" && last==="09") quarter="Q3";
      else if(first==="10" && last==="12") quarter="Q4";

      return `${quarter} ${dayjs(`${start}-01`).format("MMM YYYY")}   ${dayjs(
        `${end}-01`
      ).format("MMM YYYY")}`;
    }
    return dayjs(`${monthKey}-01`).format("MMM YYYY");
  };
  

  return (
    <Box
      sx={{
        position: "relative",
        p: 0,
        m: 0,
        height: "100%",
        overflow: clientDialogOpen ? "hidden" : "auto",
        transition: "all 0.3s ease-in-out",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Client Summary
      </Typography>

      <Box
        onClick={() => setClientDialogOpen(false)}
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 19,
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(6px)",
          opacity: clientDialogOpen ? 1 : 0,
          pointerEvents: clientDialogOpen ? "auto" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            width: 320,
            height: "100%",
            zIndex: 20,
            backgroundColor: "white",
            padding: 2,
            transform: clientDialogOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "all 0.3s ease",
            overflowY: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Select Clients
          </Typography>

          <Box
            sx={{
              maxHeight: "60vh",
              overflowY: "auto",
              mb: 2,
              scrollBehavior: "smooth",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {clientDepartments.map(({ client, departments }) => {
              const isExpanded = expandedClient === client;
              const clientChecked =
                selectedClients[client]?.length === departments.length &&
                departments.length > 0;
              const clientIndeterminate =
                selectedClients[client]?.length > 0 &&
                selectedClients[client]?.length < departments.length;

              return (
                <>
                  <Accordion
                    key={client}
                    expanded={isExpanded}
                    onChange={() =>
                      setExpandedClient(isExpanded ? null : client)
                    }
                    sx={{
                      mb: 1,
                      backgroundColor: "transparent",
                      boxShadow: "none",
                      width: "100%",
                      transition: "backgroundColor 0.3s ease",
                    }}
                    disableGutters
                  >
                    <AccordionSummary
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        width: "100%",
                        transition: "transform 0.1s ease",
                      }}
                    >
                      <span className="flex items-center w-[90%]">
                        <FormControlLabel
                          sx={{ alignItems: "center" }}
                          control={
                            <Checkbox
                              disableRipple
                              checked={clientChecked}
                              indeterminate={clientIndeterminate}
                              onChange={() => toggleDepartment(client, "ALL")}
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                transition:
                                  "background-color 0.2s ease, transform 0.2s ease",
                                "&:focus": {
                                  outline: "none",
                                  boxShadow: "none",
                                },
                              }}
                            />
                          }
                          label={
                            <Typography fontWeight={600} fontSize={12}>
                              {client}
                            </Typography>
                          }
                        />
                      </span>
                      <span
                        className="flex items-center"
                        style={{
                          transition: "all 0.3s ease",
                          transform: isExpanded
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        }}
                      >
                        <ChevronDown size={20} />
                      </span>
                    </AccordionSummary>

                    <AccordionDetails sx={{ px: 2, py: 1 }}>
                      {departments.map((dept) => (
                        <FormControlLabel
                          key={dept}
                          control={
                            <Checkbox
                              disableRipple
                              checked={
                                selectedClients[client]?.includes(dept) || false
                              }
                              onChange={() => toggleDepartment(client, dept)}
                              sx={{
                                transition: " .3s ease",
                              }}
                            />
                          }
                          label={dept}
                          sx={{
                            display: "block",
                            ml: 3,
                            mb: 0.5,
                            transition: "none",
                          }}
                        />
                      ))}
                    </AccordionDetails>
                  </Accordion>
                </>
              );
            })}
          </Box>

          <span className="flex justify-between w-full">
            <Button
              sx={{ mt: 2, transition: "all 0.3s ease" }}
              variant="outlined"
              color="error"
              onClick={() => {
                if (selectedClients.length === 0) {
                  return;
                } else {
                  setSelectedClients([]);
                  runFetch(token, { clients: "ALL" });
                }
              }}
            >
              Clear
            </Button>
            <Button
              sx={{ mt: 2, transition: "all 0.3s ease" }}
              variant="contained"
              onClick={() => {
                handleClientSummaryWithDepartments();
              }}
            >
              Search
            </Button>
          </span>
        </Box>
      </Box>

      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 3,
          alignItems: "center",
        }}
      >
        <Box>
          <Button
            variant="outlined"
            color="primary"
            sx={{ py: 1, transition: "all 0.3s ease" }}
            size="small"
            onClick={() => setClientDialogOpen(true)}
          >
            Select Clients
          </Button>
        </Box>

        {timelineSelection === "range" && (
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
              minDate={startMonth ? dayjs(startMonth) : undefined}
              disableFuture
              onChange={(v) => setEndMonth(v)}
              slotProps={{ textField: { size: "small", sx: { width: 150 } } }}
            />
          </LocalizationProvider>
        )}

        {timelineSelection === "monthly" && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
  <DatePicker
    views={["year"]}
    label="Select Year"
    value={year}
    onChange={(v) => {
      setYear(v);
      if (v) {
        setMultipleMonths(monthsList.map((m) => m.value));
      } else {
        setMultipleMonths([]);
      }
    }}
    disableFuture
    slotProps={{ textField: { size: "small", sx: { width: 150 } } }}
  />

  <Box sx={{ position: "relative", width: 160, display: "inline-block" }}>
    <FormControl sx={{ width: "100%" }} size="small">
      <InputLabel>Select Months</InputLabel>
      <Select
        multiple
        value={multipleMonths}
        onChange={(e) => {
          const value = e.target.value;
          const uniqueValues = Array.from(new Set(value));
          setMultipleMonths(uniqueValues);
        }}
        input={<OutlinedInput label="Select Months" />}
        disabled={!year}
        renderValue={(selected) =>
          selected.length === 12
            ? "All Months"
            : selected
                .map((m) => monthsList.find((x) => x.value === m)?.label)
                .join(", ")
        }
      >
        <MenuItem
          value="ALL"
          onClick={() => {
            if (multipleMonths.length === 12) {
              setMultipleMonths([]);
            } else {
              setMultipleMonths(monthsList.map((m) => m.value));
            }
          }}
        >
          <Checkbox checked={multipleMonths.length === 12} />
          <ListItemText primary="All Months" />
        </MenuItem>

        {monthsList.map((month) => (
          <MenuItem key={month.value} value={month.value}>
            <Checkbox checked={multipleMonths.includes(month.value)} />
            <ListItemText primary={month.label} />
          </MenuItem>
        ))}
      </Select>

      {!year && (
        <FormHelperText
          sx={{
            position: "absolute",
            bottom: -20,
            left: 0,
            fontSize: "0.75rem",
            color: "error.main",
          }}
        >
          Please select year
        </FormHelperText>
      )}
    </FormControl>
  </Box>
</LocalizationProvider>

        )}

        {timelineSelection === "quarterly" && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              views={["year"]}
              label="Select Year"
              value={year}
              onChange={(v) => {
                setYear(v);
                if (v) {
                  setQuarterlySelection(
                    quarterlyList.map((m) => {
                      m.value;
                    })
                  );
                } else {
                  setQuarterlySelection([]);
                }
              }}
              disableFuture
              slotProps={{ textField: { size: "small", sx: { width: 150 } } }}
            />
             <Box sx={{ position: "relative", width: 160, display: "inline-block" }}>
            <FormControl sx={{ width: 160}} size="small">
              <InputLabel>Select Quarter</InputLabel>

              <Select
                multiple
                value={quarterlySelection}
                onChange={(e) => {
                  const value = e.target.value;
                  const filtered = value.filter(Boolean);
                  setQuarterlySelection([...new Set(filtered)]);
                }}
                input={<OutlinedInput label="Select Quarter" />}
                disabled={!year}
                renderValue={(selected) => {
                  const filtered = selected.filter(Boolean);
                  return filtered.length === 0
                    ? ""
                    : filtered
                        .map(
                          (q) => quarterlyList.find((x) => x.value === q)?.label
                        )
                        .join(", ");
                }}
              >
                {quarterlyList.map((qtr) => (
                  <MenuItem key={qtr.value} value={qtr.value}>
                    <Checkbox
                      checked={quarterlySelection.includes(qtr.value)}
                    />
                    <ListItemText primary={qtr.label} />
                  </MenuItem>
                ))}
              </Select>
              {!year && (
        <FormHelperText
          sx={{
            position: "absolute",
            bottom: -20,
            left: 0,
            fontSize: "0.75rem",
            color: "error.main",
          }}
        >
          Please select year
        </FormHelperText>
      )}
            </FormControl>
            </Box>
          </LocalizationProvider>
        )}

        <Box>
          <FormControl sx={{ width: 120 }}>
            <InputLabel>Selection</InputLabel>
            <Select
              value={timelineSelection}
              label="selection"
              size="small"
              onChange={(e) => setTimelineSelection(e.target.value)}
            >
              {timelines.map((timeline) => (
                <MenuItem key={timeline.value} value={timeline.value}>
                  {timeline.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Button
          variant="contained"
          onClick={() => {
            handleClientSummaryWithDepartments();
          }}
        >
          Search
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            setStartMonth(null);
            setEndMonth(null);
            setYear(null);
            setMultipleMonths([]);
            setQuarterlySelection([]);
            runFetch(token, { clients: "ALL" });
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
        const formattedMonth = formatMonthKey(monthKey);

        const clientsMap = monthObj?.clients || monthObj || {};
        console.log("clientsMap", monthObj);

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

        const monthTotalAmount = monthTotals.total_allowance ?? 0;
        const monthTotalA= monthTotals.A ?? 0;
        const monthTotalB= monthTotals.B ?? 0;
        const monthTotalC= monthTotals.C ?? 0;
        const monthTotalPRIME= monthTotals.PRIME ?? 0;
        const diff = prevTotal !== null ? monthTotalAmount - prevTotal : 0;

        let diffColor = "black";
        if (prevTotal !== null) {
          if (diff > 0) diffColor = "red";
          else if (diff < 0) diffColor = "green";
        }

        prevTotal = monthTotalAmount;

        return (
          <Accordion
            key={monthKey}
            expanded={expandedMonth.includes(monthKey)}
            onChange={() => {
              setExpandedMonth((prev) =>
                prev.includes(monthKey)
                  ? prev.filter((key) => key !== monthKey)
                  : [...prev, monthKey]
              );
            }}
            TransitionProps={{
              timeout: 300,
            }}
            sx={{
              mb: 2,
              boxShadow: "none",
              border: "1px solid #ddd",
              width: "100%",
              transition: "all 0.3s ease-in-out",
            }}
          >
            <AccordionSummary
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 5,
                backgroundColor: "#f5f5f5",
                px: 2,
                "& .MuiAccordionSummary-content": {
                  margin: 0,
                  transition: "margin 0.3s ease",
                },
                transition: "all 0.3s ease",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography fontWeight="bold">{formattedMonth}</Typography>

                <Typography fontWeight="bold" color={diffColor}>
                  Headcount: {monthTotals.total_head_count} — Total: ₹
                  {monthTotalAmount}
                  {diff !== 0 && ` (${diff > 0 ? "+" : ""}${diff})`}
                </Typography>

                <Box
                  sx={{
                    transition: "transform 0.3s ease",
                    transform:
                      expandedMonth === monthKey
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                  }}
                >
                  <ChevronDown />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Box
                sx={{
                  maxHeight: 400,
                  overflowY: "scroll",
                  position: "relative",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
              >
                {/* <Table sx={{ borderCollapse: "collapse" }}>
                  <TableHead
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 4,
                      backgroundColor: "#000",
                    }}
                  >
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
                      <TableCell sx={headerCellStyle(colWidths.A)}>
                        <span>Shift A</span><br/>
                        <span className="text-[12px]">&#x20B9;340</span> <br/> 
                        <span className="text-[9px]">(09 PM to 06 AM)</span>
                      </TableCell>
                      <TableCell sx={headerCellStyle(colWidths.B)}>
                      <span>Shift B</span><br/>
                        <span className="text-[12px]">&#x20B9;340</span> <br/> 
                        <span className="text-[9px]">(04 PM to 01 AM)</span>
                      </TableCell>
                      <TableCell sx={headerCellStyle(colWidths.C)}>
                        <span>Shift B</span><br/>
                        <span className="text-[12px]">&#x20B9;340</span> <br/> 
                        <span className="text-[9px]">(06 AM to 03 PM)</span>
                      </TableCell>
                      <TableCell sx={headerCellStyle(colWidths.PRIME)}>
                       <span>Shift C</span><br/>
                        <span className="text-[12px]">&#x20B9;340</span> <br/> 
                        <span className="text-[9px]">(12 AM to 09 AM)</span>
                      </TableCell>
                      <TableCell sx={headerCellStyle(colWidths.amount)}>
                        Amount
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {Object.entries(clientsMap)
                      .filter(
                        ([name]) => name !== "total" && name !== "month_total"
                      )
                      .map(([clientName, clientObj]) => {
                        const clientKey = `${monthKey}-client-${clientName}`;
                        const departments = clientObj?.departments || {};

                        return (
                          <React.Fragment key={clientKey}>
                            <TableRow
                              sx={{
                                backgroundColor: "#e9f5ff",
                                transition: "all 0.3s ease-in-out",
                              }}
                            >
                              <TableCell
                                sx={labelCellStyle(0)}
                                onClick={() => toggleOpen(clientKey)}
                              >
                                {clientName}
                                <IconButton size="small">
                                  <Box
                                    sx={{
                                      transition: "transform 0.3s ease",
                                      transform: openMap[clientKey]
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                    }}
                                  >
                                    <ChevronDown />
                                  </Box>
                                </IconButton>
                              </TableCell>

                              <TableCell
                                sx={rightCellStyle(colWidths.headCount)}
                              >
                                {clientObj.client_head_count ?? "-"}
                              </TableCell>
                              <TableCell
                                sx={tableCellStyle(colWidths.accountManager)}
                              />
                              <TableCell sx={rightCellStyle(colWidths.A)}>
                                &#x20B9;{clientObj.client_A ?? 0}
                              </TableCell>
                              <TableCell sx={rightCellStyle(colWidths.B)}>
                                &#x20B9;{clientObj.client_B ?? 0}
                              </TableCell>
                              <TableCell sx={rightCellStyle(colWidths.C)}>
                                &#x20B9;{clientObj.client_C ?? 0}
                              </TableCell>
                              <TableCell sx={rightCellStyle(colWidths.PRIME)}>
                                &#x20B9;{clientObj.client_PRIME ?? 0}
                              </TableCell>
                              <TableCell sx={rightCellStyle(colWidths.amount)}>
                                &#x20B9;{clientObj.client_total ?? 0}
                              </TableCell>
                            </TableRow>
                            {openMap[clientKey] &&
                              Object.entries(departments).map(
                                ([deptName, deptObj]) => {
                                  const deptKey = `${clientKey}-dept-${deptName}`;
                                  return (
                                    <React.Fragment key={deptKey}>
                                      <TableRow
                                        key={deptKey}
                                        sx={{
                                          backgroundColor: "#f5f7ff",
                                          transition: "all 0.3s ease-in-out",
                                        }}
                                        onClick={() => toggleOpen(deptKey)}
                                      >
                                        <TableCell sx={labelCellStyle(2)}>
                                          {deptName}
                                          <IconButton size="small">
                                            <Box
                                              sx={{
                                                transition:
                                                  "transform 0.3s ease",
                                                transform: openMap[deptKey]
                                                  ? "rotate(180deg)"
                                                  : "rotate(0deg)",
                                              }}
                                            >
                                              <ChevronDown />
                                            </Box>
                                          </IconButton>
                                        </TableCell>
                                        <TableCell
                                          sx={rightCellStyle(
                                            colWidths.headCount
                                          )}
                                        >
                                          {deptObj.dept_head_count ?? 0}
                                        </TableCell>
                                        <TableCell
                                          sx={tableCellStyle(
                                            colWidths.accountManager
                                          )}
                                        />
                                        <TableCell
                                          sx={rightCellStyle(colWidths.A)}
                                        >
                                          &#x20B9;{deptObj.dept_A}
                                        </TableCell>
                                        <TableCell
                                          sx={rightCellStyle(colWidths.B)}
                                        >
                                          &#x20B9;{deptObj.dept_B}
                                        </TableCell>
                                        <TableCell
                                          sx={rightCellStyle(colWidths.C)}
                                        >
                                          {deptObj.dept_C}
                                        </TableCell>
                                        <TableCell
                                          sx={rightCellStyle(colWidths.PRIME)}
                                        >
                                          &#x20B9;{deptObj.dept_PRIME}
                                        </TableCell>
                                        <TableCell
                                          sx={rightCellStyle(colWidths.amount)}
                                        >
                                          &#x20B9;{deptObj.dept_total ?? 0}
                                        </TableCell>
                                      </TableRow>
                                      {openMap[deptKey] &&
                                        (deptObj.employees || []).map((emp) => (
                                          <TableRow
                                            key={`${deptKey}-emp-${emp.emp_id}`}
                                            sx={{
                                              backgroundColor: "#ffffff",
                                              transition:
                                                "all 0.3s ease-in-out",
                                            }}
                                          >
                                            <TableCell sx={labelCellStyle(4)}>
                                              {emp.emp_name}
                                              <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                display="block"
                                              >
                                                {emp.emp_id}
                                              </Typography>
                                            </TableCell>

                                            <TableCell
                                              sx={rightCellStyle(
                                                colWidths.headCount
                                              )}
                                            >
                                              1
                                            </TableCell>

                                            <TableCell
                                              sx={{...tableCellStyle(
                                                colWidths.accountManager
                                              ),textAlign:"center"}}
                                            >
                                              {emp.account_manager}
                                            </TableCell>

                                            <TableCell
                                              sx={rightCellStyle(colWidths.A)}
                                            >
                                              &#x20B9;{emp.A}
                                            </TableCell>
                                            <TableCell
                                              sx={rightCellStyle(colWidths.B)}
                                            >
                                              &#x20B9;{emp.B}
                                            </TableCell>
                                            <TableCell
                                              sx={rightCellStyle(colWidths.C)}
                                            >
                                              &#x20B9;{emp.C}
                                            </TableCell>
                                            <TableCell
                                              sx={rightCellStyle(
                                                colWidths.PRIME
                                              )}
                                            >
                                              &#x20B9;{emp.PRIME}
                                            </TableCell>
                                            <TableCell
                                              sx={rightCellStyle(
                                                colWidths.amount
                                              )}
                                            >
                                              &#x20B9;{emp.total}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                    </React.Fragment>
                                  );
                                }
                              )}
                          </React.Fragment>
                        );
                      })}
                    <TableRow sx={{ backgroundColor: "#dfeff0" }}>
                      <TableCell
                        sx={{
                          ...tableCellStyle(colWidths.label),
                          fontWeight: "bold",
                        }}
                      >
                        Month Total
                      </TableCell>
                      <TableCell
                        sx={{
                          ...rightCellStyle(colWidths.headCount),
                          fontWeight: "bold",
                        }}
                      >
                        {monthTotals?.total_head_count ?? "-"}
                      </TableCell>
                      <TableCell
                        sx={tableCellStyle(colWidths.accountManager)}
                      />
                      <TableCell sx={{...rightCellStyle(colWidths.A),fontWeight:"bold"}} > &#x20B9;{monthTotalA}</TableCell>
                      <TableCell sx={{...rightCellStyle(colWidths.B),fontWeight:"bold"}} > &#x20B9;{monthTotalB}</TableCell>
                      <TableCell sx={{...rightCellStyle(colWidths.C),fontWeight:"bold"}} > &#x20B9;{monthTotalC}</TableCell>
                      <TableCell sx={{...rightCellStyle(colWidths.PRIME),fontWeight:"bold"}} > &#x20B9;{monthTotalPRIME}</TableCell>
                      <TableCell
                        sx={{
                          ...rightCellStyle(colWidths.amount),
                          fontWeight: "bold",
                        }}
                      >
                        &#x20B9;{monthTotals?.total_allowance ?? "-"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table> */}

                {
  loading ? (
    <Box sx={{ p: 2 }}>
      <Typography>Loading...</Typography>
    </Box>
  ) : data?.message ? (
    <Box sx={{ p: 2 }}>
      <Typography color="error">{data.message}</Typography>
    </Box>
  ) : (
    <ClientSummaryTable
      clientsMap={clientsMap}
      monthTotals={monthTotals}
      monthTotalA={monthTotalA}
      monthTotalB={monthTotalB}
      monthTotalC={monthTotalC}
      monthTotalPRIME={monthTotalPRIME}
    />
  )
}

              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default ClientSummaryDetailedPage;