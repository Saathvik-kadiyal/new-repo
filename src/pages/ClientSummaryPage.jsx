import React, { useEffect, useState } from "react";
import { fetchClientSummary } from "../utils/helper";
import axios from "axios";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const ClientSummaryPage = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = dayjs();
  const [startMonth, setStartMonth] = useState(today);
  const [endMonth, setEndMonth] = useState(null);

  const fetchSummary = async () => {
    if (!startMonth) return;
    setLoading(true);
    setError("");

    const token = localStorage.getItem("access_token");

    try {
      let data;

      if (!endMonth || startMonth.isSame(endMonth, "month")) {
        // Single month
        data = await fetchClientSummary(token, startMonth.format("YYYY-MM"));
      } else {
        // Multiple months / interval
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_API}/interval/get_interval_summary`, {
          params: {
            start_month: startMonth.format("YYYY-MM"),
            end_month: endMonth.format("YYYY-MM"),
          },
          headers: { Authorization: `Bearer ${token}` },
        });
        data = res.data;

        // Normalize object to array for table
        if (data && typeof data === "object" && !Array.isArray(data)) {
          data = Object.entries(data).map(([clientName, values]) => ({
            client: clientName,
            ...values,
          }));
        }
      }

      setSummaryData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to fetch summary data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [startMonth, endMonth]);

  const headers = summaryData.length > 0 ? Object.keys(summaryData[0]) : [];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-xl font-bold">Client Summary</h2>

        <div className="flex gap-2 mt-2 md:mt-0">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              views={["year", "month"]}
              label="Start Month"
              value={startMonth}
              onChange={(newValue) => setStartMonth(newValue)}
              renderInput={(params) => <TextField {...params} size="small" className="w-40" />}
              inputFormat="YYYY-MM"
            />

            <DatePicker
              views={["year", "month"]}
              label="End Month (Optional)"
              value={endMonth}
              onChange={(newValue) => setEndMonth(newValue)}
              renderInput={(params) => <TextField {...params} size="small" className="w-40" />}
              inputFormat="YYYY-MM"
            />
          </LocalizationProvider>
        </div>
      </div>

      {loading ? (
        <p>Loading summary data...</p>
      ) : (
        <table className="border-collapse border border-gray-300 w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-100">
              {headers.length > 0
                ? headers.map((key) => (
                    <th key={key} className="border px-2 py-1 capitalize text-left">
                      {key.replace(/_/g, " ")}
                    </th>
                  ))
                : <th className="border px-2 py-1 text-center">No Headers</th>}
            </tr>
          </thead>

          <tbody>
            {error ? (
              <tr>
                <td colSpan={headers.length || 1} className="text-center text-red-500 py-6 font-medium">
                  {error}
                </td>
              </tr>
            ) : summaryData.length === 0 ? (
              <tr>
                <td colSpan={headers.length || 1} className="text-center py-6 text-gray-500 font-medium">
                  No summary data available.
                </td>
              </tr>
            ) : (
              summaryData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {headers.map((key) => (
                    <td key={key} className="border px-2 py-1">
                      {item[key] ?? ""}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ClientSummaryPage;
