import React, { useEffect, useState, useMemo } from "react";
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
import { formatRupeesWithUnit } from "../utils/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const HorizontalAllowanceBarChart = ({ chartDataFromParent, enums }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const labelToClientMap = useMemo(() => {
    if (!enums) return {};
    return Object.entries(enums).reduce((acc, [clientName, enumObj]) => {
      acc[enumObj.value] = clientName;
      return acc;
    }, {});
  }, [enums]);

  useEffect(() => {
    if (!chartDataFromParent) return;

    const labels = Object.keys(chartDataFromParent).map(
      (clientName) => enums?.[clientName]?.value || clientName
    );

    const data = Object.values(chartDataFromParent).map(
      (item) => item.total_allowance
    );

    const colors = Object.keys(chartDataFromParent).map(
      (clientName) => enums?.[clientName]?.hexcode || "#4caf50"
    );

    setChartData({
      labels,
      datasets: [
        {
          label: "Total Allowance",
          data,
          backgroundColor: colors,
          barThickness: 20,
          maxBarThickness: 25,
        },
      ],
    });
  }, [chartDataFromParent, enums]);

  return (
    <Bar
      data={chartData}
      height={400}
      options={{
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
         layout: {
          padding: {
            right: 70,
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
            enabled: true,
            callbacks: {
              label: (context) => {
                const label = context.label;
                const client = labelToClientMap[label] || label;
                const clientData = chartDataFromParent?.[client];

                if (!clientData) return "";

                return [
                  `Client: ${client}`,
                  `Total Allowance:   ${formatRupeesWithUnit(clientData.total_allowance)||0}`,
                  `Shift A: ${formatRupeesWithUnit(clientData.shift_A?.total)||0}`,
                  `Shift B: ${formatRupeesWithUnit(clientData.shift_B?.total)||0}`,
                  `Shift C: ${formatRupeesWithUnit(clientData.shift_C?.total) || 0}`,
                  `Shift PRIME: ${formatRupeesWithUnit(clientData.shift_PRIME?.total) || 0}`,
                ];
              },
            },
          },
          datalabels: {
            anchor: "end",
            align: "end",
            offset: 10,
            formatter: (value) => `${formatRupeesWithUnit(value)}`,
            font: { weight: "bold", size: 12 },
            color: "#000",
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: (value) => formatRupeesWithUnit(value),
            },
          },
          y: {
            ticks: { autoSkip: false },
          },
        },
      }}
    />
  );
};

export default HorizontalAllowanceBarChart;
