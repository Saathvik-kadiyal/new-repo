import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

// COLORS FOR EACH MONTH
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];


const prepareChartData = ({ data, selectedDept = null, startMonth = null, endMonth = null }) => {
  if (!data || Object.keys(data).length === 0) return [];

  const allMonths = Object.keys(data);

  // MONTH FILTER LOGIC
  let filteredMonths;
  if (!startMonth && !endMonth) {
    filteredMonths = allMonths; 
  } else if (startMonth && !endMonth) {
    filteredMonths = [startMonth];
  } else if (startMonth && endMonth) {
    const sIndex = allMonths.indexOf(startMonth);
    const eIndex = allMonths.indexOf(endMonth);
    filteredMonths =
      sIndex !== -1 && eIndex !== -1 && sIndex <= eIndex
        ? allMonths.slice(sIndex, eIndex + 1)
        : [];
  }

  // DEPARTMENT FILTER
  const allDepartments = Object.keys(data[allMonths[0]]);
  const departments =
    selectedDept && selectedDept !== "" ? [selectedDept] : allDepartments;

  // BUILD RESULT DATA
  return departments.map((dep) => {
    const depData = { department: dep };
    filteredMonths.forEach((month) => {
      depData[month] = data[month][dep]?.TotalAllowance || 0;
      depData[`${month}_emp`] = data[month][dep]?.TotalEmployee || 0;
    });
    return depData;
  });
};


const StackedBarChart = ({
  data,           
  selectedDept,
  startMonth,
  endMonth 
}) => {
  console.log("Props received:", { data, selectedDept, startMonth, endMonth });
  const months = Object.keys(data);
  const chartData = prepareChartData({
    data,
    selectedDept,
    startMonth,
    endMonth,
  });
  

  const [hoverInfo, setHoverInfo] = useState(null);

  const handleHover = (data, barMonth) => {
    if (!data || !barMonth) return;

    const department = data.department;
    const depData = data && data[barMonth]?.[department];
    if (!depData) return;

    setHoverInfo({
      month: barMonth,
      department,
      employees: depData.Employees || [],
      totalAllowance: depData.TotalAllowance,
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Department Allowances (Stacked by Month)
      </h2>

      <div className="relative">
        <div style={{ height: "420px", overflow: "hidden" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip content={() => null} />
              <Legend />

              {months.map((month, idx) => (
                <Bar key={month} dataKey={month} stackId="a">
                  {chartData.map((entry, entryIdx) => (
                    <Cell
                      key={`cell-${entryIdx}`}
                      fill={COLORS[idx % COLORS.length]}
                      fillOpacity={
                        hoverInfo?.month === month &&
                        hoverInfo?.department === entry.department
                          ? 0.7
                          : 1
                      }
                      onMouseOver={() => handleHover(entry, month)}
                      onMouseOut={() => setHoverInfo(null)}
                    />
                  ))}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* HOVER BOX */}
        {hoverInfo && (
          <div
            className="absolute bg-white shadow-lg border border-gray-300 p-2 rounded text-sm"
            style={{ top: 10, left: 10, pointerEvents: "none", zIndex: 10 }}
          >
            <div><strong>Month:</strong> {hoverInfo.month}</div>
            <div><strong>Total Employees:</strong> {hoverInfo.employees.length}</div>
          </div>
        )}
      </div>

      {/* EMPLOYEE TABLE */}
      {hoverInfo && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">
            {hoverInfo.department} – {hoverInfo.month}
          </h3>

          <table className="border-collapse border border-gray-300 w-full text-sm text-gray-700">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">EmpID</th>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Allowance</th>
              </tr>
            </thead>
            <tbody>
              {hoverInfo.employees.map((emp, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{emp.EmpID}</td>
                  <td className="border px-2 py-1">{emp.Name}</td>
                  <td className="border px-2 py-1">{emp.Allowance}</td>
                </tr>
              ))}

              <tr className="font-bold bg-gray-200">
                <td className="border px-2 py-1">{hoverInfo.month} Total</td>
                <td className="border px-2 py-1"></td>
                <td className="border px-2 py-1">{hoverInfo.totalAllowance}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StackedBarChart;
