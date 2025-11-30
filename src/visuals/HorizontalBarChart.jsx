// components/HorizontalBarChart.jsx
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
const token = localStorage.getItem("access_token");

// Month names Jan to Nov
const months = [
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
];

const HorizontalBarChart = () => {
  const currentMonth = dayjs().format("YYYY-MM");
  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (selectedMonth) => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendApi}/dashboard/horizontal-bar`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { duration_month: selectedMonth },
      });
      const apiData = res.data.horizontal_bar;
      const chartData = Object.keys(apiData).map((client) => ({
        client,
        ...apiData[client],
      }));
      setData(chartData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  console.log(data)

  useEffect(() => {
    fetchData(month);
  }, [month]);

  const series = ["total_unique_employees"];

  return (
    <Box>
      {/* Month Selector */}
      <div className="flex flex-row justify-between">
        <Typography>
          No.of Employees
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150, mb: 2 }}>
        <InputLabel>Month</InputLabel>
        <Select
          value={month}
          label="Month"
          onChange={(e) => setMonth(e.target.value)}
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

      {/* Chart or Loader */}
      {loading ? (
        <CircularProgress />
      ) : data.length === 0 ? (
        <Typography>No data available for this month.</Typography>
      ) : (
        <BarChart
  dataset={data.map((d) => ({
    client: d.client,
    total_unique_employees: d.total_unique_employees,
  }))}
  series={[
    {
      dataKey: "total_unique_employees",
      label: "Employees",
    },
  ]}
  yAxis={[{ scaleType: "band", dataKey: "client" }]} // <-- client names on y-axis
  layout="horizontal"
  height={300}
/>

      )}
    </Box>
  );
};

export default HorizontalBarChart;
