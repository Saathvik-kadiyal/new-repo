import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, FormControl, Select, MenuItem, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts";

const GraphChart = ({ startMonth, endMonth }) => {
  const backendApi = import.meta.env.VITE_BACKEND_API;

  const [selectedClient, setSelectedClient] = useState("");
  const [clients, setClients] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], values: [] });

  const token = localStorage.getItem("access_token");

  const axiosInstance = axios.create({
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axiosInstance.get(`${backendApi}/dashboard/clients`);

        if (res.data?.clients?.length) {
          const clientNames = res.data.clients.map((c) =>
            c.name ? c.name : String(c)
          );

          setClients(clientNames);

          setSelectedClient(clientNames[0]);
        }
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };

    fetchClients();
  }, [backendApi, token]);

  useEffect(() => {
    if (!selectedClient) return;

    const fetchGraphData = async () => {
      try {
        const params = { client_name: selectedClient };
        if (startMonth) params.start_month = startMonth;
        if (endMonth) params.end_month = endMonth;

        const res = await axiosInstance.get(`${backendApi}/dashboard/graph`, {
          params,
        });

        const graph = res.data.graph || {};

        const labels = Object.keys(graph).map((m) => {
          const date = new Date(m + "-01");
          return date.toLocaleString("default", { month: "short" });
        });
        
        const values = Object.values(graph);
        setChartData({ labels, values });
      } catch (err) {
        console.error("Error fetching graph:", err);
        setChartData({ labels: [], values: [] });
      }
    };

    fetchGraphData();
  }, [selectedClient, startMonth, endMonth, backendApi, token]);

  return (
    <Box display="flex" flexDirection="column" height="100%" p={2}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <FormControl sx={{ width: 150 }}>
          <Select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            variant="standard"
            sx={{
              borderBottom: "1px solid #000",
              borderRadius: 0,
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
  xAxis={[
    { data: chartData.labels, scaleType: "point", label: "Month" },
  ]}
  series={[
    {
      data: chartData.values,
      label: "Total Allowance",
      showMark: true,
      markSize: 6,
      pointLabel: (value) => `₹${value.toLocaleString("en-IN")}`,
      pointLabelPlacement: "above", 
      valueFormatter: (v) => `₹${v.toLocaleString("en-IN")}`,
    },
  ]}
  margin={{ top: 60 }} 
  height={320}
/>


        ) : (
          <Typography color="white" textAlign="center" mt={4}>
            Loading graph...
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default GraphChart;
