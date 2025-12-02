import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import Slider from "@mui/material/Slider";
import { getClientsAndDepartments } from "../utils/helper";

const Comparision = () => {
  const [clients, setClients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(["All"]);
  const [highlightMonth, setHighlightMonth] = useState(null);
  const [monthRange, setMonthRange] = useState([null, null]);
  const [clientAndDepartmentObject, setClientAndDepartmentObject] =
    useState(null);

  const data = {
    "2025-03": {
      digital: {
        total_allowance: "10000",
        head_count: "20",
        diff: "0",
        emp: [],
      },
      infra: { total_allowance: "20000", head_count: "23", diff: "0", emp: [] },
      hr: { total_allowance: "8000", head_count: "10", diff: "2", emp: [] },
      finance: {
        total_allowance: "15000",
        head_count: "14",
        diff: "1",
        emp: [],
      },
      marketing: {
        total_allowance: "9000",
        head_count: "12",
        diff: "-1",
        emp: [],
      },
      sales: { total_allowance: "18000", head_count: "17", diff: "0", emp: [] },
      operations: {
        total_allowance: "11000",
        head_count: "15",
        diff: "0",
        emp: [],
      },
      qa: { total_allowance: "9500", head_count: "11", diff: "1", emp: [] },
    },
    "2025-04": {
      digital: {
        total_allowance: "12000",
        head_count: "22",
        diff: "1",
        emp: [],
      },
      infra: {
        total_allowance: "25000",
        head_count: "25",
        diff: "-1",
        emp: [],
      },
      finance: {
        total_allowance: "9000",
        head_count: "11",
        diff: "0",
        emp: [],
      },
    },
    "2025-05": {
      digital: {
        total_allowance: "11500",
        head_count: "21",
        diff: "0",
        emp: [],
      },
      infra: { total_allowance: "24000", head_count: "23", diff: "0", emp: [] },
    },
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const formatMonth = (key) => {
    const [year, month] = key.split("-");
    return `${monthNames[Number(month) - 1]} ${year}`;
  };

  const convertToDataset = (dataObj) => {
    return Object.entries(dataObj).map(([monthKey, departments]) => {
      const row = { year: formatMonth(monthKey) };
      Object.entries(departments).forEach(([deptName, deptData]) => {
        row[deptName] = Number(deptData.total_allowance);
        row[`${deptName}_head`] = deptData.head_count
          ? Number(deptData.head_count)
          : null;
      });
      return row;
    });
  };

  const getSeries = (dataObj, maxPerStack = 3) => {
    const firstMonth = Object.values(dataObj)[0];
    const departmentKeys = Object.keys(firstMonth);
    const totalStacks = Math.ceil(departmentKeys.length / maxPerStack);
    const stackNames = Array.from(
      { length: totalStacks },
      (_, i) => `stack${i + 1}`
    );

    return departmentKeys.map((dept, idx) => {
      const stackIndex = Math.floor(idx / maxPerStack);
      return {
        dataKey: dept,
        stack: stackNames[stackIndex],
        label: (v) =>
          v ? dept.charAt(0).toUpperCase() + dept.slice(1) : undefined,
        valueFormatter: (v) => (v ? `$${v.toLocaleString()}` : undefined),
      };
    });
  };

  const dataset = convertToDataset(data);
  const series = getSeries(data, 3);

  const config = {
    height: 350,
    width: 1000,
    margin: { left: 0 },
    hideLegend: false,
  };

  const handleBarClick = (e, item) => {
    if (item?.dataIndex != null) {
      const monthKey = Object.keys(data)[item.dataIndex];
      setHighlightMonth(monthKey);
    }
  };

  const monthKeys = Object.keys(data);
  const allDepartments = Array.from(
    new Set(monthKeys.flatMap((m) => Object.keys(data[m])))
  );

const handleMonthRange = (e, newValue, activeThumb) => {
  if (monthRange[0] === null) {
    setMonthRange([newValue[0], newValue[0]]);
    return;
  }
  let start = monthRange[0];
  let end = monthRange[1];

  if (activeThumb === 0) {
    start = Math.min(newValue[0], end);
  } else {
    end = Math.max(newValue[1], start);
  }

  setMonthRange([start, end]);
};


  useEffect(() => {
    const handleClickOutside = () => setHighlightMonth(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getClientsAndDepartments();
      setClientAndDepartmentObject(res.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    let clients = [];
    if (clientAndDepartmentObject) {
      clientAndDepartmentObject.map((details) => {
        clients.push(details.client);
      });
      setClients(clients);
    }
  }, [clientAndDepartmentObject]);

  useEffect(() => {
    if (clientAndDepartmentObject) {
      clientAndDepartmentObject.map((details, i) => {
        if (details.client == selectedClient) {
          setDepartments(details.departments);
        }
      });
    }
  }, [selectedClient]);
  console.log(selectedDepartment);

  useEffect(() => {
    if (clients.length > 0 && selectedClient === "") {
      setSelectedClient(clients[0]);
    }
  }, [clients]);

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 2,alignItems:"center" }}>
        <Box>
          <FormControl sx={{ width: 200 }}>
            <InputLabel>Client</InputLabel>
            <Select
              value={selectedClient}
              label="Client"
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              {clients.map((client) => (
                <MenuItem key={client} value={client}>
                  {client}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <FormControl sx={{ width: 250 }}>
            <InputLabel>Department</InputLabel>
            <Select
              multiple
              label="Department"
              value={selectedDepartment}
              onChange={(e) => {
                let value = e.target.value;
                if (!Array.isArray(value)) value = [value];

                const lastClicked = value[value.length - 1];
                if (lastClicked === "All") {
                  setSelectedDepartment(["All"]);
                  return;
                }
                if (selectedDepartment.includes("All")) {
                  setSelectedDepartment([lastClicked]);
                  return;
                }
                if (value.length === 0) {
                  setSelectedDepartment(["All"]);
                  return;
                }
                setSelectedDepartment(value);
              }}
              renderValue={(selected) =>
                selected.includes("All") ? "All" : selected.join(", ")
              }
            >
              <MenuItem value="All">All</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box>
          <Box sx={{ width: 280}}>
  <Typography fontWeight="bold">Month Range</Typography>
  <Slider
    value={[monthRange[0] ?? 0, monthRange[1] ?? 0]}
    min={0}
    max={11}
    step={1}
    onChange={handleMonthRange}
     valueLabelDisplay={monthRange[0] === null ? "off" : "auto"}
    valueLabelFormat={(v) => monthNames[v]}
      disableSwap
  />
  <Typography mt={1}>
    {monthNames[monthRange[0]]} – {monthNames[monthRange[1]]}
  </Typography>
  
</Box>

        </Box>
      </Box>

      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Box mt={4}>
          <Typography>Department Allowance</Typography>
          <BarChart
            dataset={dataset}
            series={series}
            xAxis={[{ dataKey: "year" }]}
            onItemClick={handleBarClick}
            onClick={(e) => {
              e.stopPropagation();
            }}
            {...config}
          />
        </Box>

        <Box
          mt={4}
          sx={{
            p: 2,
            borderRadius: 2,
            overflow: "hidden",
            maxWidth: 900,
          }}
        >
          <Table
            sx={{
              borderCollapse: "collapse",
              "& td, & th": {
                border: "1px solid #ddd",
                padding: "8px 12px",
                textAlign: "center",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    borderBottom: "none !important",
                    borderRight: "none !important",
                    borderLeft: "none !important",
                    borderTop: "none !important",

                    width: 150,
                  }}
                ></TableCell>

                <TableCell
                  sx={{
                    width: 150,
                    borderBottom: "none !important",
                    borderRight: "none !important",
                    borderLeft: "none !important",
                    borderTop: "none !important",
                  }}
                ></TableCell>

                {monthKeys.map((m) => (
                  <TableCell
                    key={m}
                    sx={{
                      fontWeight: "bold",
                      background: "black",
                      color: "white",
                      width: 150,
                      backgroundColor:
                        highlightMonth === m ? "#ffe36e" : "black",
                      color: highlightMonth === m ? "black" : "white",
                      transition: "0.3s",
                      cursor: "pointer",
                    }}
                  >
                    {formatMonth(m)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {[selectedClient].map((client) => {
                const departmentsForClient =
                  selectedDepartment.length === 0 ||
                  selectedDepartment.includes("All")
                    ? departments
                    : selectedDepartment;

                return departmentsForClient.map((dept, idx) => {
                  return (
                    <TableRow key={`${client}-${dept}`}>
                      {idx === 0 && (
                        <TableCell
                          sx={{ fontWeight: 500, background: "#f5f5f5" }}
                          rowSpan={departmentsForClient.length}
                        >
                          {client}
                        </TableCell>
                      )}

                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          background: "#fafafa",
                          textTransform: "capitalize",
                          cursor: "pointer",
                        }}
                      >
                        {dept}
                      </TableCell>

                      {monthKeys.map((m, i) => {
                        const val = data[m][dept];
                        const value = val ? `$ ${val.total_allowance}` : "—";
                        return (
                          <TableCell
                            key={i}
                            sx={{
                              backgroundColor:
                                highlightMonth === m
                                  ? "#ffe36e"
                                  : "transparent",
                              transition: "0.3s",
                            }}
                          >
                            {value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                });
              })}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default Comparision;
