import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, FormControl, Select, MenuItem, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts";
 
const GraphChart = () => {
  const backendApi = import.meta.env.VITE_BACKEND_API;
 
  const [client, setClient] = useState("");
  const [clients, setClients] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], values: [] });
 
  const token = localStorage.getItem("access_token");
 
  const axiosInstance = axios.create({
    headers: { Authorization: `Bearer ${token}` },
  });
 
  // Fetch clients for dropdown
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axiosInstance.get(`${backendApi}/dashboard/clients`);
        if (res.data?.clients?.length) {
          setClients(res.data.clients);
          setClient(res.data.clients[0]); // default selection
        }
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };
    fetchClients();
  }, [backendApi, token]);
 
  useEffect(() => {
    if (!client) return;
 
    const fetchGraph = async () => {
      try {
        const res = await axiosInstance.get(`${backendApi}/dashboard/graph`, {
            headers: { Authorization: `Bearer ${token}` },
          params: { client_name : client },
        });
        const graph = res.data.graph || {};
        const labels = Object.keys(graph);  
        const values = Object.values(graph);  
        setChartData({ labels, values });
      } catch (err) {
        console.error("Error fetching graph data:", err);
        setChartData({ labels: [], values: [] });
      }
    };
    fetchGraph();
  }, [client, backendApi, token]);
 
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      p={2}
      borderRadius={2}
    >
      <Box display="flex" justifyContent="flex-end" mb={2}> 
  <FormControl sx={{ width: 150 }}>
    <Select
      value={client}
      onChange={(e) => setClient(e.target.value)}
      variant="standard"           // makes it a line-style select
      sx={{
        borderBottom: "1px solid #000", // bottom border color
        borderRadius: 0,                // remove any rounding
      }}
    >
      {clients.map((c) => (
        <MenuItem key={c} value={c}>
          {c}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>

 
      {/* Line Chart */}
      <Box flex={1}>
        {chartData.labels.length > 0 ? (
          <LineChart
            xAxis={[{ data: chartData.labels, scaleType: "band", label: "Month" }]}
            series={[{ data: chartData.values, showMark: true, label: "Total Allowance" }]}
            height={320}
          />
        ) : (
          <Typography color="white" textAlign="center" mt={4}>
            No data available for this client.
          </Typography>
        )}
      </Box>
    </Box>
  );
};
 
export default GraphChart;
 
 