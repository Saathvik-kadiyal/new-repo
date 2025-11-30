import React, { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts";
import {
  Box,
  CircularProgress,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";

const backendApi = import.meta.env.VITE_BACKEND_API;
const token = localStorage.getItem("access_token")

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November"
];


const VerticalBarChart = () => {
  const currentMonth = dayjs().format("YYYY-MM");
  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (month) => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendApi}/dashboard/vertical-graph`, {
headers: { Authorization: `Bearer ${token}` },
        params: { duration_month: month },
      });

      const chartData = res.data.map(item => ({
        client: item.client_name,
        total_days: item.total_days,
        total_allowances: item.total_allowances,
      }));

      setData(chartData);
    } catch (err) {
      console.error("Error fetching vertical graph data:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(month);
  }, [month]);

  const config = {
    height: 300,
    margin: { left: 50 },
    yAxis: [{ width: 60 }],
    hideLegend: false,
  };

  return (
    <Box>
      <div className="flex flex-row justify-between px-4">
        <Typography> Total Allowances</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Month</InputLabel>
        <Select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          variant="standard"
          sx={{ borderBottom: "1px solid #000", borderRadius: 0 }}
        >
          {months.map((monthName, idx) => {
            const monthString = dayjs().month(idx).format("YYYY-MM");
            return (
              <MenuItem key={idx} value={monthString}>
                {monthName}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      </div>

      {/* Loader */}
      {loading && <CircularProgress />}

      {/* Chart */}
      {!loading && data.length > 0 ? (
        <BarChart
  dataset={data}
  series={[
    { dataKey: "total_allowances", label: "Total Allowances", color: "#3f51b5", yAxis: "left" },
    { dataKey: "total_days", label: "Total Days", color: "#f50057", yAxis: "right" },
  ]}
  xAxis={[
    {
      dataKey: "client",   
      label: "Client",        
      tickFormatter: () => "", 
    },
  ]}
  yAxis={[
    { id: "left", width: 60, label: "Allowances" },
    { id: "right", width: 60, label: "Days" },
  ]}
  {...config}
/>

      ) : (
        !loading && <Typography>No data available for this month.</Typography>
      )}
    </Box>
  );
};

export default VerticalBarChart;
