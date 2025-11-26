import React, { useEffect, useState } from "react";
import { fetchClientSummary, fetchClientSummaryRange } from "../utils/helper";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const ClientSummaryPage = () => {
  const [summaryData, setSummaryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startMonth, setStartMonth] = useState(null);
  const [endMonth, setEndMonth] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("access_token");

    try {
      let data;

      if (!startMonth) {
        const res = await fetchClientSummary(token); 
        const defaultMonth = dayjs().subtract(1, "month").format("YYYY-MM"); 
        data = { [defaultMonth]: res };
      } else if (!endMonth || startMonth.isSame(endMonth, "month")) {
        const res = await fetchClientSummary(token, startMonth.format("YYYY-MM"));
        data = { [startMonth.format("YYYY-MM")]: res };
      } else {
        data = await fetchClientSummaryRange(
          token,
          startMonth.format("YYYY-MM"),
          endMonth.format("YYYY-MM")
        );
      }

      setSummaryData(data || {});
    } catch (err) {
      setError(err.message || "Unable to fetch summary data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [startMonth, endMonth]);

  const allEmpty = Object.values(summaryData).every((list) => list.length === 0);

  const clearDates = () => {
    setStartMonth(null);
    setEndMonth(null);
  };

  return (
    <div className="p-6">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-xl font-bold">Client Summary</h2>

        <div className="flex gap-2 items-center">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {/* Start Month */}
            <DatePicker
              views={["year", "month"]}
              label="Start Month"
              value={startMonth}
              onChange={setStartMonth}
              inputFormat="YYYY-MM"
              disableFuture
              maxDate={dayjs()}
              slotProps={{ textField: { size: "small", className: "w-40" } }}
            />

            {/* End Month */}
            <DatePicker
              views={["year", "month"]}
              label="End Month (Optional)"
              value={endMonth}
              onChange={setEndMonth}
              inputFormat="YYYY-MM"
              disableFuture
              minDate={startMonth || undefined}
              maxDate={dayjs()}
              slotProps={{ textField: { size: "small", className: "w-40" } }}
            />
          </LocalizationProvider>

          {/* CLEAR BUTTON */}
          <button
            onClick={clearDates}
            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Clear
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      {loading ? (
        <p>Loading summary data...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : allEmpty ? (
        <p className="text-center text-red-500 font-semibold py-6 text-lg">
          There is no data from{" "}
          {startMonth ? startMonth.format("YYYY-MM") : dayjs().subtract(1, "month").format("YYYY-MM")}
          {endMonth ? ` to ${endMonth.format("YYYY-MM")}` : ""}
        </p>
      ) : (
        Object.entries(summaryData).map(([month, rows]) => (
          <div
            key={month}
            className="mb-8 bg-white p-4 rounded-xl shadow-md border border-gray-200"
          >
            <h3 className="text-lg font-bold mb-3 text-gray-800">{month}</h3>

            {rows.length === 0 ? (
              <p className="text-red-500 italic">No data for this month.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="border-collapse border border-gray-300 w-full text-sm text-gray-700 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-100">
                      {Object.keys(rows[0]).map((key) => (
                        <th
                          key={key}
                          className="border px-2 py-2 capitalize text-left font-semibold"
                        >
                          {key.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item, idx) => {
                      const isTotalRow = item.client === "TOTAL";
                      return (
                        <tr
                          key={idx}
                          className={isTotalRow ? "bg-gray-200 font-bold" : "hover:bg-gray-50"}
                        >
                          {Object.keys(item).map((key) => (
                            <td key={key} className="border px-2 py-1">
                              {item[key]}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ClientSummaryPage;
