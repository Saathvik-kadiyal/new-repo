import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart } from "@mui/x-charts";
import { Box, CircularProgress, Typography } from "@mui/material";

const TotalShifts = ({ startMonth, endMonth, topFilter = "Top5" }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const backendApi = import.meta.env.VITE_BACKEND_API;
  const token = localStorage.getItem("access_token");

  const fetchData = async (startMonth, endMonth, topFilter) => {
    try {
      setLoading(true);

      const params = { top: topFilter };
      if (startMonth) params.start_month = startMonth;
      if (endMonth) params.end_month = endMonth;

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
    fetchData(startMonth, endMonth, topFilter);
  }, [startMonth, endMonth, topFilter]);

  const chartData = data.map((item) => ({
    client:item.client_enum,
    total_allowances: item.total_allowances,
    total_shifts: item.total_days,
  }));

  const formatCompact = (num) => {
    if (!num && num !== 0) return "";
    if (num >= 10000000) return (num / 10000000).toFixed(2) + "Cr";
    if (num >= 100000) return (num / 100000).toFixed(2) + "L";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  const maxValueAllowance = Math.max(...chartData.map(d => d.total_allowances));
  const maxValueShifts = Math.max(...chartData.map(d => d.total_shifts));

  return (
    <Box sx={{ width: "100%", height: 400 ,marginTop:12}}>
        <Typography>
            Total Shifts
        </Typography>
      {loading ? (
        <CircularProgress />
      ) : chartData.length === 0 ? (
        <Typography>No data found</Typography>
      ) : (
        <BarChart
          dataset={chartData}
          layout="horizontal"
          series={[
            // {
            //   dataKey: "total_allowances",
            //   label: "Total Allowances",
            //   color: "#3f51b5",
            //   yAxisKey: "clientAxis", 
            //   valueFormatter: (v) => `₹${formatCompact(v)}`,
            //   barLabel: (item) => `₹${formatCompact(item.value)}`,
            //   barLabelPlacement: "outside",
            // },
            {
              dataKey: "total_shifts",
              label: "Total Shifts",
              color: "#f50057",
              yAxisKey: "clientAxis",
              barLabel: (item) => item.value,
              barLabelPlacement: "outside",
            },
          ]}
          yAxis={[
            {
              id: "clientAxis",
              scaleType: "band",
              dataKey: "client",
              tickLabelStyle: { fontSize: 10 },
              slotProps: { axisTickLabel: { width: 200 } },
            },
          ]}
          xAxis={[
            {
              scaleType: "linear",
              label: "Total Number of Shifts Worked",
              min: 0,
              max: Math.max(maxValueShifts)+100,
              tickValues: Array.from(
                { length: Math.ceil(Math.max(maxValueShifts) / 10) + 1 },
                (_, i) => i * 10
              ),
            },
            
          ]}
         width={800}
          height={400}
        />
      )}
    </Box>
  );
};

export default TotalShifts;
