import React, { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts";
import {
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import axios from "axios";

const backendApi = import.meta.env.VITE_BACKEND_API;
const token = localStorage.getItem("access_token");

const HorizontalBarChart = ({ startMonth, endMonth, topFilter }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

 
  const buildParams = () => {
    const params = {};

    
    if (startMonth && (!endMonth || startMonth === endMonth)) {
      params.duration_month = startMonth;
    }

    if (startMonth && endMonth && startMonth !== endMonth) {
      params.start_month = startMonth;
      params.end_month = endMonth;
    }

    if (topFilter && topFilter !== "all") {
      params.top = topFilter;
    }

    return params;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = buildParams();

      const res = await axios.get(`${backendApi}/dashboard/horizontal-bar`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: params,
      });

      const apiData = res.data.horizontal_bar || {};

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

  useEffect(() => {
    fetchData();
  }, [startMonth, endMonth, topFilter]);

  return (
    <Box>
      <Typography className="mb-2 font-semibold">
        No. of Employees
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : data.length === 0 ? (
        <Typography>No data available.</Typography>
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
          yAxis={[{ scaleType: "band", dataKey: "client" }]}
          layout="horizontal"
          height={300}
        />
      )}
    </Box>
  );
};

export default HorizontalBarChart;
