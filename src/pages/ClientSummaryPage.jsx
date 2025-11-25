import React, { useEffect, useState } from "react";
const backendApi = import.meta.env.VITE_BACKEND_API;
import axios from "axios";

const ClientSummaryPage = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Current month default
  const today = new Date();
  const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const months = [
    "01", "02", "03", "04", "05", "06",
    "07", "08", "09", "10", "11", "12"
  ];


const fetchSummary = async (monthValue) => {
  setLoading(true);
  setError("");

  try {
    const { data } = await axios.get(
      `${backendApi}/summary/client-shift-summary`,
      {
        params: { payroll_month: monthValue },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    setSummaryData(Array.isArray(data) ? data : []);
  } catch (err) {
    setError("Unable to fetch summary data. Please try again later.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchSummary(selectedMonth);
  }, [selectedMonth]);

  const headers = summaryData.length > 0 ? Object.keys(summaryData[0]) : [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Client Summary</h2>

        {/* Month Selector */}
        <select
          className="border px-3 py-2 rounded-md bg-white text-[12px]"
          value={selectedMonth.slice(5, 7)}
          onChange={(e) => {
            const newMonth = `${today.getFullYear()}-${e.target.value}`;
            setSelectedMonth(newMonth);
          }}
        >
          {months.map((m, i) => (
            <option key={i} value={m}>
              {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading summary data...</p>
      ) : (
        <table className="border-collapse border border-gray-300 w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-100">
              {headers.length > 0 ? (
                headers.map((key) => (
                  <th key={key} className="border px-2 py-1 capitalize text-left">
                    {key.replace(/_/g, " ")}
                  </th>
                ))
              ) : (
                <th className="border px-2 py-1 text-center">No Headers</th>
              )}
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
