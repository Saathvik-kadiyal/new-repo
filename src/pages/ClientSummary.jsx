import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";

const ClientSummary = () => {
  const location = useLocation();
  const data = location.state?.data || [];

  const rows = Array.isArray(data) ? data : [data];

  const summary = useMemo(() => {
    const result = {};
    const toNumber = (value) => {
      if (!value) return 0;
      const num = Number(String(value).replace(/[₹, ]/g, "").trim());
      return isNaN(num) ? 0 : num;
    };

    rows.forEach((row) => {
      const client = row["Client"] || "Unknown Client";
      if (!result[client]) {
        result[client] = {
          employees: 0,
          shiftA: 0,
          shiftB: 0,
          shiftC: 0,
          prime: 0,
          totalAllowances: 0,
        };
      }
      result[client].employees += 1;
      result[client].shiftA += toNumber(row["Shift A (09 PM to 06 AM) INR 500"]);
      result[client].shiftB += toNumber(row["Shift B (04 PM to 01 AM) INR 350"]);
      result[client].shiftC += toNumber(row["Shift C (06 AM to 03 PM) INR 100"]);
      result[client].prime += toNumber(row["Prime (12 AM to 09 AM) INR 700"]);
      result[client].totalAllowances += toNumber(row["TOTAL DAYS Allowances"]);
    });
    return result;
  }, [rows]);

  const clients = Object.keys(summary);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Client Summary</h2>
        <button
          onClick={() => window.history.back()}
          className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
        >
          ← Back
        </button>
      </div>

      {clients.length === 0 ? (
        <p className="text-gray-500 text-sm">No client data available.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full text-sm text-gray-700 border-collapse">
            <thead className="bg-gray-100 text-gray-700 text-sm font-semibold">
              <tr>
                <th className="border px-3 py-2 text-left">Client</th>
                <th className="border px-3 py-2 text-right">Employees</th>
                <th className="border px-3 py-2 text-right">Shift A (₹500)</th>
                <th className="border px-3 py-2 text-right">Shift B (₹350)</th>
                <th className="border px-3 py-2 text-right">Shift C (₹100)</th>
                <th className="border px-3 py-2 text-right">Prime (₹700)</th>
                <th className="border px-3 py-2 text-right">Total Allowances</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client}
                  className="hover:bg-green-50 transition-colors"
                >
                  <td className="border px-3 py-2 font-medium text-gray-800">
                    {client}
                  </td>
                  <td className="border px-3 py-2 text-right">
                    {summary[client].employees}
                  </td>
                  <td className="border px-3 py-2 text-right">
                    ₹{summary[client].shiftA.toLocaleString("en-IN")}
                  </td>
                  <td className="border px-3 py-2 text-right">
                    ₹{summary[client].shiftB.toLocaleString("en-IN")}
                  </td>
                  <td className="border px-3 py-2 text-right">
                    ₹{summary[client].shiftC.toLocaleString("en-IN")}
                  </td>
                  <td className="border px-3 py-2 text-right">
                    ₹{summary[client].prime.toLocaleString("en-IN")}
                  </td>
                  <td className="border px-3 py-2 text-right font-semibold text-blue-700">
                    ₹{summary[client].totalAllowances.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientSummary;
