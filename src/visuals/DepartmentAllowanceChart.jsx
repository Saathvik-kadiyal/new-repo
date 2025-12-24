import React, { useMemo } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { ChartsTooltip } from "@mui/x-charts/ChartsTooltip";
import { formatRupeesWithUnit } from "../utils/utils";

const DepartmentAllowanceChart = ({ transformedData, clientName = "" }) => {
  const departments = transformedData?.[clientName] || [];

 const dataset = useMemo(() => {
  return departments
    .map((item) => {
      const deptName = Object.keys(item)[0];
      const data = item[deptName];

      if (!data) return null;

      return {
        department: deptName,
        total_allowance: data.total_allowance,
        head_count: data.head_count,
        shift_A: data.shift_A?.total || 0,
        shift_A_head: data.shift_A?.head_count || 0,
        shift_B: data.shift_B?.total || 0,
        shift_B_head: data.shift_B?.head_count || 0,
        shift_C: data.shift_C?.total || 0,
        shift_C_head: data.shift_C?.head_count || 0,
        shift_PRIME: data.shift_PRIME?.total || 0,
        shift_PRIME_head: data.shift_PRIME?.head_count || 0,
      };
    })
    .filter(Boolean);
}, [departments]);


  return (
   <LineChart
  height={400}
  dataset={dataset}
  xAxis={[{ dataKey: "department", scaleType: "band" }]}
  yAxis={[{ width: 70, valueFormatter: (v) => `${formatRupeesWithUnit(v)}` }]}
  series={[
    {
      dataKey: "total_allowance",
      label: "Total Allowance",
      color: "green",
      valueFormatter: (v) => formatRupeesWithUnit(v),
    },
    {
      dataKey: "shift_A",
      label: "Shift A",
      valueFormatter: (v) => formatRupeesWithUnit(v),
    },
    {
      dataKey: "shift_B",
      label: "Shift B",
      valueFormatter: (v) => formatRupeesWithUnit(v),
    },
    {
      dataKey: "shift_C",
      label: "Shift C",
      valueFormatter: (v) => formatRupeesWithUnit(v),
    },
    {
      dataKey: "shift_PRIME",
      label: "Shift PRIME",
      valueFormatter: (v) => formatRupeesWithUnit(v),
    },
  ]}
  // slots={{ tooltip: ChartsTooltip }}
  // slotProps={{
  //   tooltip: {
  //     trigger: "axis",
  //     axisContent: ({ seriesItems }) => {
  //       if (!seriesItems?.length) return null;
  //       const row = dataset[seriesItems[0].dataIndex];
  //       return (
  //         <div
  //           style={{
  //             padding: 10,
  //             background: "#fff",
  //             border: "1px solid #ddd",
  //             borderRadius: 6,
  //             fontSize: 12,
  //             minWidth: 200,
  //           }}
  //         >
  //           <strong>{row.department}</strong>
  //           <div>Total Allowance: {formatRupeesWithUnit(row.total_allowance)}</div>
  //           <div>Head Count: {row.head_count}</div>
  //           <hr style={{ margin: "6px 0", borderColor: "#eee" }} />
  //           <div>Shift A: {formatRupeesWithUnit(row.shift_A)} ({row.shift_A_head})</div>
  //           <div>Shift B: {formatRupeesWithUnit(row.shift_B)} ({row.shift_B_head})</div>
  //           <div>Shift C: {formatRupeesWithUnit(row.shift_C)} ({row.shift_C_head})</div>
  //           <div>Shift PRIME: {formatRupeesWithUnit(row.shift_PRIME)} ({row.shift_PRIME_head})</div>
  //         </div>
  //       );
  //     },
  //   },
  // }}
/>

  );
};

export default DepartmentAllowanceChart;
