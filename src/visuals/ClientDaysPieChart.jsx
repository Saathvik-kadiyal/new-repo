import React, { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { fetchClientSummary } from "../utils/helper";
import dayjs from "dayjs";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Typography, Checkbox, FormControlLabel } from "@mui/material";

const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const COLORS = [
  "#4e79a7",
  "#f28e2b",
  "#e15759",
  "#76b7b2",
  "#59a14f",
  "#edc949",
  "#af7aa1",
  "#ff9da7",
  "#9c755f",
  "#bab0ab",
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
];

const ClientPieChartWithMonth = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("MM"));
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);

  const getSummary = async (month) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const payrollMonth = `${dayjs().format("YYYY")}-${month}`;
      const res = await fetchClientSummary(token, payrollMonth);

      const formatted = res.map((c, i) => ({
        id: c.client,
        label: c.client,
        value:
          (c.shift_a_days || 0) +
          (c.shift_b_days || 0) +
          (c.shift_c_days || 0) +
          (c.prime_days || 0),
        color: COLORS[i % COLORS.length],
        details: c,
      }));

      setData(formatted);
      setSelectedClient(null);
      setClientDetails(null);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSummary(selectedMonth);
  }, [selectedMonth]);

  const chartData = selectedClient
    ? data.filter((d) => d.label === selectedClient)
    : data;

  useEffect(() => {
    if (selectedClient) {
      const found = data.find((d) => d.label === selectedClient);
      setClientDetails(found?.details || null);
    } else {
      setClientDetails(null);
    }
  }, [selectedClient, data]);

  return (
    <div className="w-full h-full flex flex-col gap-3 p-1">
      <div className="flex flex-row justify-between align-middle">
        <Typography variant="subtitle1">Client vs Shifts</Typography>

        <Select
          size="small"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          sx={{
            "& fieldset": { border: "none" },
            "& .MuiOutlinedInput-root": { paddingRight: "0px" },
          }}
          className="absolute right-0 bg-white w-[140px] text-sm border-b border-b-neutral-700"
        >
          {months.map((m) => (
            <MenuItem key={m.value} value={m.value}>
              {m.label}
            </MenuItem>
          ))}
        </Select>
      </div>

      <div className="flex gap-3 items-start py-4">
        <div className="w-[230px] h-[230px] flex justify-center items-center">
          {loading ? (
            <p>Loading...</p>
          ) : data.length === 0 ? (
            <p>No data available</p>
          ) : (
            <div className="relative w-[230px] h-[230px]">
              <PieChart
                series={[{ data: chartData, arcLabel: () => "" }]}
                width={230}
                height={230}
                slotProps={{ legend: { hidden: true } }}
                colors={chartData.map((d) => d.color)}
              />

              {/* Centered overlay text */}
              {clientDetails && (
                <div
                  className="
                  absolute top-1/2 left-1/2
                  -translate-x-1/2 -translate-y-1/2
                  text-center whitespace-pre-line text-[12px] text-white pointer-events-none
                "
                >
                  <strong>{clientDetails.client}</strong>
                  {"\n"}Shift A: {clientDetails.shift_a_days}
                  {"\n"}Shift B: {clientDetails.shift_b_days}
                  {"\n"}Shift C: {clientDetails.shift_c_days}
                  {"\n"}Prime: {clientDetails.prime_days}
                  {"\n"}Employees: {clientDetails.total_employees}
                  {"\n"}Allowances: {clientDetails.total_allowances}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Checkboxes list */}
        <div
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          className="max-h-60 overflow-y-scroll flex flex-col gap-1 pr-2 no-scrollbar"
        >
          {data.map((item) => (
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
                  {item.label} — {item.value} days
                </span>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientPieChartWithMonth;
