import React, { useState, useEffect, useCallback } from "react";
import ClientDaysPieChart from "../visuals/ClientDaysPieChart";

import GraphChart from "../visuals/GraphChart";

import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  Accordion,
  AccordionSummary,
  FormControlLabel,
  Checkbox,
  AccordionDetails,
  InputLabel,
  OutlinedInput,
  ListItemText,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import VerticalBarChart from "../visuals/VerticalBarChart";
import HorizontalBarChart from "../visuals/HorizontalBarChart";
import TotalShifts from "../visuals/TotalShifts";
import {
  debounce,
  fetchClientDepartments,
  fetchDashboardClientSummary,
} from "../utils/helper";
import { ChevronDown } from "lucide-react";
import DepartmentBarChart from "../visuals/DepartmentBarChart.jsx";
import DonutChart from "../visuals/DonutChart.jsx";

const DashboardPage = () => {
  const [selectedClients, setSelectedClients] = useState([]);
  const [clientDepartments, setClientDepartments] = useState([]);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [expandedClient, setExpandedClient] = useState(null);
  const [startMonth, setStartMonth] = useState(null);
  const [endMonth, setEndMonth] = useState(null);
  const [topFilter, setTopFilter] = useState("5");
  const [timelineSelection, setTimelineSelection] = useState("range");
  const [year, setYear] = useState(null);
  const [multipleMonths, setMultipleMonths] = useState([]);
  const [quarterlySelection, setQuarterlySelection] = useState([]);
  const [transformedData, setTransformedData] = useState({});
  const [selectedDonutClient, setSelectedDonutClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({});

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
        const res = await fetchDashboardClientSummary(token, payload);
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
    let payload = {
      clients: "ALL",
      top: topFilter,
    };
    runFetch(payload);
  }, []);

  const transformData = (data) => {
    const result = {};
    if (data.dashboard) {
      for (const clientName in data.dashboard.clients) {
        const clientData = data.dashboard.clients[clientName];
        const clientKey = clientName;

        const clientInfo = [];
        for (const depName in clientData.department) {
          const depData = clientData.department[depName];
          const departmentInfo = {
            [depName]: {
              total_allowance: depData.total_allowance,
              head_count: depData.head_count,
              shift_A: depData.shift_A,
              shift_B: depData.shift_B,
              shift_C: depData.shift_C,
              shift_PRIME: depData.shift_PRIME,
            },
          };
          clientInfo.push(departmentInfo);
        }

        result[clientKey] = clientInfo;
      }
    }

    return result;
  };

  useEffect(() => {
    if (data.dashboard) {
      const transformed = transformData(data);
      setTransformedData(transformed);
    }
  }, [data]);

  console.log("Transformed Data:", transformedData);

  const handleClientSummaryWithDepartments = () => {
    const payload = {
      clients:
        Object.keys(selectedClients).length > 0 ? selectedClients : "ALL",
    };
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
    if (topFilter) {
      payload.top = topFilter;
    }

    runFetch(payload);
    setClientDialogOpen(false);
  };

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
        const allDepartments =
          clientDepartments.find((c) => c.client === client)?.departments || [];

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

  return (
    <>
      <Box>
        <Box
          sx={{
            position: "relative",
            p: 0,
            pt: 2,
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
                transform: clientDialogOpen
                  ? "translateX(0)"
                  : "translateX(-100%)",
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
                                  onChange={() =>
                                    toggleDepartment(client, "ALL")
                                  }
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
                                    selectedClients[client]?.includes(dept) ||
                                    false
                                  }
                                  onChange={() =>
                                    toggleDepartment(client, dept)
                                  }
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
                      runFetch({ clients: "ALL" });
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
                  slotProps={{
                    textField: { size: "small", sx: { width: 150 } },
                  }}
                />
                <DatePicker
                  views={["year", "month"]}
                  label="End Month"
                  value={endMonth}
                  minDate={startMonth ? dayjs(startMonth) : undefined}
                  disableFuture
                  onChange={(v) => setEndMonth(v)}
                  slotProps={{
                    textField: { size: "small", sx: { width: 150 } },
                  }}
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
                  slotProps={{
                    textField: { size: "small", sx: { width: 150 } },
                  }}
                />

                <Box
                  sx={{
                    position: "relative",
                    width: 160,
                    display: "inline-block",
                  }}
                >
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
                              .map(
                                (m) =>
                                  monthsList.find((x) => x.value === m)?.label
                              )
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
                          <Checkbox
                            checked={multipleMonths.includes(month.value)}
                          />
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
                  slotProps={{
                    textField: { size: "small", sx: { width: 150 } },
                  }}
                />
                <Box
                  sx={{
                    position: "relative",
                    width: 160,
                    display: "inline-block",
                  }}
                >
                  <FormControl sx={{ width: 160 }} size="small">
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
                                (q) =>
                                  quarterlyList.find((x) => x.value === q)
                                    ?.label
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

            <Box>
              <FormControl sx={{ width: 120 }}>
                <InputLabel>Top Filter</InputLabel>
                <Select
                  value={topFilter}
                  label="Top Filter"
                  size="small"
                  onChange={(e) => setTopFilter(e.target.value)}
                >
                  <MenuItem value="5">Top 5</MenuItem>
                  <MenuItem value="10">Top 10</MenuItem>
                  <MenuItem value="ALL">All</MenuItem>
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
                runFetch({ clients: "ALL" });
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        <Box>
          <div className="flex flex-col md:flex-row gap-8 items-center">
  <div className="w-full md:w-3/5 h-80  rounded-md shadow-sm flex justify-center items-center">
    {data.dashboard ? (
      <DonutChart
        clients={data.dashboard.clients}
        onSelectClient={setSelectedDonutClient}
        topN={topFilter}
      />
    ) : (
      loading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress color="black" size={40} />
          <Typography sx={{ color: "black" }}>Loading...</Typography>
        </Box>
      )
    )}
  </div>

  <div className="w-full md:w-11/20 h-80 rounded-md shadow-sm flex justify-center items-center">
    {selectedDonutClient ? (
      <DepartmentBarChart
        clientName={selectedDonutClient}
        transformedData={transformedData}
      />
    ) : (
      <h3 className="text-center">Click on the slice to view the graph</h3>
    )}
  </div>
</div>

        </Box>
      </Box>
    </>
  );
};

export default DashboardPage;
