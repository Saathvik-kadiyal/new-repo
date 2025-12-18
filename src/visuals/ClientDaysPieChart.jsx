import React, { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { pieChart } from "../utils/helper";
import { Typography, Checkbox, FormControlLabel } from "@mui/material";
 
const COLORS = [
  "#4e79a7","#f28e2b","#e15759","#76b7b2","#59a14f","#edc949",
  "#af7aa1","#ff9da7","#9c755f","#bab0ab","#1f77b4","#ff7f0e",
  "#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f",
  "#bcbd22","#17becf",
];
 
const ClientDaysPieChart = ({ startMonth, endMonth, topFilter }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState([]);

 
  const getSummary = async (startMonth, endMonth, topFilter) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await pieChart(token, startMonth, endMonth, topFilter);
 
      console.log("API RESPONSE →", res);
 
      let formatted = [];
 
     
      if (Array.isArray(res)) {
        formatted = res.map((c, i) => {
          console.log("details",c)
          return({
          id: c.client,
          label: c.client_enum,
          value: c.total_days || (c.shift_a + c.shift_b + c.shift_c + c.prime),
          color: COLORS[i % COLORS.length],
          details: c,
        })
        });
      } else if (typeof res === "object" && !Array.isArray(res)) {
        const keys = Object.keys(res);
        if (keys.length === 1 && Array.isArray(res[keys[0]])) {
         
          const arr = res[keys[0]];
          console.log(arr)
          formatted = arr.map((details,color) => {
            console.log("hi",details)
            return(
              ({
          
            id: details.client,
            label: details.client_name,
            value: details.total_days || (c.shift_a_days + c.shift_b_days + c.shift_c_days + c.prime_days),
            color: COLORS[color % COLORS.length],
            details: c,
          })
            )
          });
        } else {
         
          formatted = [{
            id: res.client,
            label: res.client,
            value: res.total_days || (res.shift_a + res.shift_b + res.shift_c + res.prime),
            color: COLORS[0],
            details: res,
          }];
        }
      }
 
      console.log("FORMATTED CLIENT DETAILS →", formatted);
 
      setData(formatted);
      setClientDetails(formatted);
      setSelectedClient(null);
 
    } catch (err) {
      console.error(err);
      setData([]);
      setClientDetails([]);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    getSummary(startMonth, endMonth, topFilter);
  }, [startMonth, endMonth, topFilter]);
 
  const chartData = selectedClient
    ? data.filter((d) => d.label === selectedClient)
    : data;
 
  console.log("GRAPH DATA →", chartData);
 
 
  useEffect(() => {
    setClientDetails(data);
  }, [data]);
 
  const graphData = React.useMemo(() => {
    if (!Array.isArray(chartData)) return [];
 
    return chartData.map((c, i) => ({
      id: c.id,
      label: c.label,
      value: c.value,
      color: c.color,
      details: c.details,
    }));
  }, [chartData]);
 
  return (
    <div className="flex flex-col gap-3 p-1 items-center pt-8">
      <div className="flex flex-row justify-between align-middle">
      </div>
 
      <div className="flex gap-3 items-start py-4">
        <div className="w-[230px] h-[230px] flex justify-center items-center">
          {loading ? (
            <p>Loading...</p>
          ) : chartData.length === 0 ? (
            <p>No data available</p>
          ) : (
            <div className="relative w-[230px] h-[230px]">
              <PieChart
                series={[{ data: graphData, arcLabel: () => "" }]}
                width={230}
                height={230}
                slotProps={{ legend: { hidden: true } }}
                colors={chartData.map((d) => d.color)}
              />
 
              {selectedClient && (
                <div
                  className="
                    absolute top-1/2 left-1/2
                    -translate-x-1/2 -translate-y-1/2
                    text-center whitespace-pre-line text-[12px] text-white pointer-events-none
                  "
                >
                  {(() => {
                    const client = chartData.find(c => c.label === selectedClient);
                    if (!client) return null;
                    return (
                      <>
                        <strong>{client.label}</strong>
                        {"\n"}Shift A: {client.details.shift_a_days || client.details.shift_a}
                        {"\n"}Shift B: {client.details.shift_b_days || client.details.shift_b}
                        {"\n"}Shift C: {client.details.shift_c_days || client.details.shift_c}
                        {"\n"}Prime: {client.details.prime_days || client.details.prime}
                        {"\n"}Employees: {client.details.total_employees}
                        {"\n"}Allowances: &#x20B9;{client.details.total_allowances}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
 
        {clientDetails && clientDetails.length > 0 && (
          <div
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            className="max-h-60 overflow-y-scroll flex flex-col gap-1 pr-2 no-scrollbar"
          >
            {clientDetails
              .filter((item) => item && item.value > 0)
              .map((item) => (
                <FormControlLabel
                  key={item.id}
                  control={
                    <Checkbox
                      checked={selectedClient === item.label}
                      onChange={() =>
                        setSelectedClient(
                          selectedClient === item.label ? null : item.label
                        )
                      }
                      style={{ color: item.color }}
                    />
                  }
                  label={
                    <span className="text-[13px] text-black">
                      {item.label} — {item.value} shift
                    </span>
                  }
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
 
export default ClientDaysPieChart;
 
 