import React, { useEffect, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

import {
  fetchClientSummary,
  fetchClientSummaryRange,
  fetchClientSummaryByAM,
  fetchClientSummaryByAMMonth,
  fetchClientSummaryByAMRange,
} from "../utils/helper";

const MONTH_MAP = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec",
};

const formatMonthTitle = (yyyyMm) => {
  if (!yyyyMm) return "";
  const [year, month] = yyyyMm.split("-");
  const monthAbbr = MONTH_MAP[month?.padStart(2, "0")];
  return monthAbbr ? `${year}-${monthAbbr}` : yyyyMm;
};

const ClientSummaryPage = () => {
  const [summaryData, setSummaryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startMonth, setStartMonth] = useState(null);
  const [endMonth, setEndMonth] = useState(null);
  const [accountManager, setAccountManager] = useState("");

  const fetchSummary = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("access_token");

    try {
      let data = {};

      if (accountManager) {
        // Account manager selected
        if (!startMonth) {
          data = await fetchClientSummaryByAM(token, accountManager);
        } else if (!endMonth || startMonth.isSame(endMonth, "month")) {
          data = await fetchClientSummaryByAMMonth(
            token,
            accountManager,
            startMonth.format("YYYY-MM")
          );
        } else {
          data = await fetchClientSummaryByAMRange(
            token,
            accountManager,
            startMonth.format("YYYY-MM"),
            endMonth.format("YYYY-MM")
          );
        }
      } else {
        if (!startMonth) {
          let res = await fetchClientSummary(token);

          if (!res || Object.keys(res).length === 0) {
            res = await fetchClientSummary(token);
          }
          data = res || {};
        } else if (startMonth && !endMonth) {
          data = await fetchClientSummary(token, startMonth.format("YYYY-MM"));
        } else {
          data = await fetchClientSummaryRange(
            token,
            startMonth.format("YYYY-MM"),
            endMonth.format("YYYY-MM")
          );
        }
      }

      setSummaryData(data || {});
    } catch (err) {
      setError(err.message || "Unable to fetch summary data.");
    } finally {
      setLoading(false);
    }
  };

  console.log(summaryData);

  useEffect(() => {
    fetchSummary();
  }, [startMonth, endMonth, accountManager]);

  const allEmpty = Object.values(summaryData).every((list) => !list || list.length === 0);

  const clearFilters = () => {
    setStartMonth(null);
    setEndMonth(null);
    setAccountManager("");
  };

  return (
    <div className="p-6">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-xl font-bold">Client Summary</h2>

        <div className="flex gap-2 items-center">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              views={["year", "month"]}
              label="Start Month"
              value={startMonth}
              onChange={setStartMonth}
              format="YYYY-MMM"
              disableFuture
              maxDate={dayjs()}
              slotProps={{ textField: { size: "small", className: "w-40" } }}
            />
            <DatePicker
              views={["year", "month"]}
              label="End Month (Optional)"
              value={endMonth}
              onChange={setEndMonth}
              format="YYYY-MMM"
              disableFuture
              minDate={startMonth || undefined}
              maxDate={dayjs()}
              slotProps={{ textField: { size: "small", className: "w-40" } }}
            />
          </LocalizationProvider>

          {/* Account Manager Input */}
          <input
            type="text"
            placeholder="Search Account Manager"
            value={accountManager}
            onChange={(e) => setAccountManager(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 w-40 text-sm"
          />

          {/* Clear Button */}
          <button
            onClick={clearFilters}
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
          {startMonth
            ? formatMonthTitle(startMonth.format("YYYY-MM"))
            : formatMonthTitle(dayjs().subtract(1, "month").format("YYYY-MM"))
          }
          {endMonth ? ` to ${formatMonthTitle(endMonth.format("YYYY-MM"))}` : ""}
        </p>
      ) : (
        Object.entries(summaryData).map(([month, rows]) => (
          <div
            key={month}
            className="mb-8 bg-white p-4 rounded-xl shadow-md border border-gray-200"
          >
            {/*  Convert backend month key */}
            <h3 className="text-lg font-bold mb-3 text-gray-800">
              {formatMonthTitle(month)}
            </h3>

            {Array.isArray(rows) && rows.length > 0 && typeof rows[0] === "string" ? (
              <p className="text-red-500 italic">{rows[0]}</p>
            ) : rows.length === 0 ? (
              <p className="text-red-500 italic">No data for this month.</p>
            ) : (
              // ✔ CASE 3: Table data
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
                             {key === "total_allowances"
                              ? `₹${item[key]}`
                              : key === "duration_month"
                              ? formatMonthTitle(item[key])
                              : item[key]}
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
