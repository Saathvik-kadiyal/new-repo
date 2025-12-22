import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";
 
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);
 
const HorizontalAllowanceBarChart = ({ chartDataFromParent }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
 
  useEffect(() => {
    if (chartDataFromParent) {
      const labels = Object.keys(chartDataFromParent);
      const data = Object.values(chartDataFromParent).map(
        (item) => item.total_allowance
      );
      const colors = Object.values(chartDataFromParent).map(
        (item) => item.color || "#4caf50"
      );
 
      setChartData({
        labels,
        datasets: [
          {
            label: "Total Allowance",
            data,
            backgroundColor: colors,
            barThickness: 20,  
            maxBarThickness: 25
          },
        ],
      });
    }
  }, [chartDataFromParent]);
 
  return (
    <Bar
      data={chartData}
      options={{
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            right: 50,
          },
        },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Client Allowance Summary",
            font: { size: 16, weight: "bold" },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const client = context.label;
                const clientData = chartDataFromParent[client];
 
                if (!clientData) return "";
 
                return [
                  `Client: ${client}`,
                  `Total: ₹${clientData.total_allowance.toLocaleString()}`,
                  `Shift A: ₹${clientData.shift_A?.total?.toLocaleString() || 0}`,
                  `Shift B: ₹${clientData.shift_B?.total?.toLocaleString() || 0}`,
                  `Shift C: ₹${clientData.shift_C?.total?.toLocaleString() || 0}`,
                  `Shift PRIME: ₹${clientData.shift_PRIME?.total?.toLocaleString() || 0}`,
                ];
              },
            },
          },
          datalabels: {
            anchor: "end",
            align: "end",
            offset: 10,
            formatter: (value) => `₹${value.toLocaleString()}`,
            font: { weight: "bold", size: 12 },
            color: "#000",
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Total Allowance",
              font: { size: 14, weight: "bold" },
            },
            ticks: {
              callback: function (value) {
                return "₹" + value.toLocaleString();
              },
            },
          },
          y: {
            title: {
              display: true,
              text: "Clients",
              font: { size: 14, weight: "bold" },
            },
            ticks: { autoSkip: false },
          },
        },
      }}
      height={400}
    />
  );
};
 
export default HorizontalAllowanceBarChart;
 
 