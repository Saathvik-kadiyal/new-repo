import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart } from "@mui/x-charts";
import { Box, CircularProgress, Typography } from "@mui/material";
 
const VerticalBarChart = ({ startMonth, endMonth, topFilter = "Top5" }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const backendApi = import.meta.env.VITE_BACKEND_API;
 const token = localStorage.getItem("access_token")
 
 
  const fetchData = async (startMonth,endMonth,topFilter) => {
    try {
      setLoading(true);
 
      const params = {
        top: topFilter,
      };
 
      const start = startMonth;
      const end = endMonth;
 
      if (start) params.start_month = start;
      if (end) params.end_month = end;
 
      console.log("PARAMS SENT TO BACKEND:", params);
 
      const res = await axios.get(`${backendApi}/dashboard/vertical-bar`, {
         headers: { Authorization: `Bearer ${token}` },
         params: params,
       });
 
      console.log("BACKEND RESPONSE:", res.data);
      setData(res.data || []);
    } catch (err) {
      console.error("ERROR FETCHING DATA:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };
 
 
  useEffect(() => {
    fetchData(startMonth,endMonth,topFilter);
  }, [startMonth, endMonth, topFilter]);
 
 
 
  const chartData = data.map((item) => ({
    client: item.client || item.client_name,
    total_allowances: item.total_allowances,
    total_shifts:item.total_days
  }));
 
 
  return (
    <Box sx={{ width: "100%", height: 400 }}>
      {loading ? (
        <CircularProgress />
      ) : chartData.length === 0 ? (
        <Typography>No data found</Typography>
      ) : (
        <BarChart
          dataset={chartData}
  series={[
    { dataKey: "total_allowances", label: "Total Allowances", color: "#3f51b5", yAxis: "left" },
    { dataKey: "total_shifts", label: "Total Shifts", color: "#f50057", yAxis: "right" },
  ]}
          xAxis={[{ dataKey: "client", scaleType: "band" }]}
     
          width={800}
          height={400}
        />
      )}
    </Box>
  );
};
 
export default VerticalBarChart;