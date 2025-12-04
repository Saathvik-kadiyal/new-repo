// import sampleData from "../pages/sampleData";
// import React, { useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   CartesianGrid,
//   ResponsiveContainer,
//   Cell,
// } from "recharts";

// const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];



// // SAMPLE DATA 

// const demoData = {
//   Jan: {
//     HR: {
//       TotalAllowance: 1000,
//       TotalEmployee: 3,
//       Employees: [
//         { EmpID: "HR01", Name: "Alice", Allowance: 300 },
//         { EmpID: "HR02", Name: "Bob", Allowance: 350 },
//         { EmpID: "HR03", Name: "Charlie", Allowance: 350 }
//       ]
//     },
//     IT: {
//       TotalAllowance: 2000,
//       TotalEmployee: 5,
//       Employees: [
//         { EmpID: "IT01", Name: "John", Allowance: 400 },
//         { EmpID: "IT02", Name: "Ravi", Allowance: 450 },
//         { EmpID: "IT03", Name: "Sara", Allowance: 350 },
//         { EmpID: "IT04", Name: "Tom", Allowance: 400 },
//         { EmpID: "IT05", Name: "Khan", Allowance: 400 }
//       ]
//     },
//     Sales: {
//       TotalAllowance: 1500,
//       TotalEmployee: 4,
//       Employees: [
//         { EmpID: "S01", Name: "Priya", Allowance: 350 },
//         { EmpID: "S02", Name: "Sam", Allowance: 400 },
//         { EmpID: "S03", Name: "Deepak", Allowance: 350 },
//         { EmpID: "S04", Name: "Lily", Allowance: 400 }
//       ]
//     }
//   },

//   Feb: {
//     HR: {
//       TotalAllowance: 1200,
//       TotalEmployee: 3,
//       Employees: [
//         { EmpID: "HR01", Name: "Alice", Allowance: 400 },
//         { EmpID: "HR02", Name: "Bob", Allowance: 400 },
//         { EmpID: "HR03", Name: "Charlie", Allowance: 400 }
//       ]
//     },
//     IT: {
//       TotalAllowance: 2100,
//       TotalEmployee: 6,
//       Employees: [
//         { EmpID: "IT01", Name: "John", Allowance: 350 },
//         { EmpID: "IT02", Name: "Ravi", Allowance: 350 },
//         { EmpID: "IT03", Name: "Sara", Allowance: 400 },
//         { EmpID: "IT04", Name: "Tom", Allowance: 350 },
//         { EmpID: "IT05", Name: "Khan", Allowance: 350 },
//         { EmpID: "IT06", Name: "Rita", Allowance: 300 }
//       ]
//     },
//     Sales: {
//       TotalAllowance: 1800,
//       TotalEmployee: 5,
//       Employees: [
//         { EmpID: "S01", Name: "Priya", Allowance: 350 },
//         { EmpID: "S02", Name: "Sam", Allowance: 400 },
//         { EmpID: "S03", Name: "Deepak", Allowance: 350 },
//         { EmpID: "S04", Name: "Lily", Allowance: 350 },
//         { EmpID: "S05", Name: "Arun", Allowance: 350 }
//       ]
//     }
//   },

//   Mar: {
//     HR: {
//       TotalAllowance: 1100,
//       TotalEmployee: 2,
//       Employees: [
//         { EmpID: "HR01", Name: "Alice", Allowance: 550 },
//         { EmpID: "HR02", Name: "Bob", Allowance: 550 }
//       ]
//     },
//     IT: {
//       TotalAllowance: 2500,
//       TotalEmployee: 7,
//       Employees: [
//         { EmpID: "IT01", Name: "John", Allowance: 350 },
//         { EmpID: "IT02", Name: "Ravi", Allowance: 350 },
//         { EmpID: "IT03", Name: "Sara", Allowance: 350 },
//         { EmpID: "IT04", Name: "Tom", Allowance: 350 },
//         { EmpID: "IT05", Name: "Khan", Allowance: 350 },
//         { EmpID: "IT06", Name: "Rita", Allowance: 350 },
//         { EmpID: "IT07", Name: "Jacob", Allowance: 400 }
//       ]
//     },
//     Sales: {
//       TotalAllowance: 1700,
//       TotalEmployee: 4,
//       Employees: [
//         { EmpID: "S01", Name: "Priya", Allowance: 425 },
//         { EmpID: "S02", Name: "Sam", Allowance: 425 },
//         { EmpID: "S03", Name: "Deepak", Allowance: 425 },
//         { EmpID: "S04", Name: "Lily", Allowance: 425 }
//       ]
//     }
//   },

//   Apr: {
//     HR: {
//       TotalAllowance: 1300,
//       TotalEmployee: 4,
//       Employees: [
//         { EmpID: "IN01804070", Name: "Alice", Allowance: 325 },
//         { EmpID: "IN01804080", Name: "Bob", Allowance: 325 },
//         { EmpID: "IN01876070", Name: "Charlie", Allowance: 325 },
//         { EmpID: "IN01234070", Name: "David", Allowance: 325 }
//       ]
//     },
//     IT: {
//       TotalAllowance: 2600,
//       TotalEmployee: 6,
//       Employees: [
//         { EmpID: "IN01804070", Name: "John", Allowance: 400 },
//         { EmpID: "IN01604070", Name: "Ravi", Allowance: 400 },
//         { EmpID: "IN01804060", Name: "Sara", Allowance: 400 },
//         { EmpID: "IN01803070", Name: "Tom", Allowance: 400 },
//         { EmpID: "IT05", Name: "Khan", Allowance: 500 },
//         { EmpID: "IT06", Name: "Rita", Allowance: 500 }
//       ]
//     },
//     Sales: {
//       TotalAllowance: 1900,
//       TotalEmployee: 5,
//       Employees: [
//         { EmpID: "IN01804070", Name: "Priya", Allowance: 380 },
//         { EmpID: "IN01604070", Name: "Sam", Allowance: 380 },
//         { EmpID: "IN01804060", Name: "Deepak", Allowance: 380 },
//         { EmpID: "IN01803070", Name: "Lily", Allowance: 380 },
    

//       ]
//     }
//   }
// };

// const prepareChartData = ({
//   data=demoData,
//   selectedDept = null,
//   startMonth = null,
//   endMonth = null,
// }) => {
   
//   if (!data || Object.keys(data).length === 0) {
//     console.log("hii")
//     return [];
//   }

//   const allMonths = Object.keys(data);
//   console.log("All months in data:", allMonths);

//   // MONTH LOGIC
//   let filteredMonths;
//   if (!startMonth && !endMonth) {
//     filteredMonths = allMonths; // default: all months
//   } else if (startMonth && !endMonth) {
//     filteredMonths = [startMonth];
//   } else if (startMonth && endMonth) {
//     const sIndex = allMonths.indexOf(startMonth);
//     const eIndex = allMonths.indexOf(endMonth);
//     filteredMonths =
//       sIndex !== -1 && eIndex !== -1 && sIndex <= eIndex
//         ? allMonths.slice(sIndex, eIndex + 1)
//         : [];
//   }
//   console.log("Filtered Months:", filteredMonths); 

//   // DEPARTMENT LOGIC
//   const allDepartments = Object.keys(data[allMonths[0]]);
//   const departments =
//     selectedDept && selectedDept !== "" ? [selectedDept] : allDepartments;
     
//     console.log("Selected Departments:", departments); 

//   // BUILD RESULT
//   return departments.map((dep) => {
//     const depData = { department: dep };
//     filteredMonths.forEach((month) => {
//       depData[month] = data[month][dep]?.TotalAllowance || 0;
//       depData[`${month}_emp`] = data[month][dep]?.TotalEmployee || 0;
//     });
//     console.log(`Data for department ${dep}:`, depData);
//     return depData;
//   });
  
// };



// // STACKED BAR CHART COMPONENT




// const StackedBarChart = () => {
//   const months = Object.keys(demoData);
//   const chartData = prepareChartData(demoData);

//   const [hoverInfo, setHoverInfo] = useState(null);

//   const handleHover = (data, barMonth) => {
//     if (!data || !barMonth) return;

//     const department = data.department;
//     const depData = demoData[barMonth][department];
//     if (!depData) return;

//     setHoverInfo({
//       month: barMonth,
//       department,
//       employees: depData.Employees || [],
//       totalAllowance: depData.TotalAllowance,
//     });
//   };

//   const clearHover = () => setHoverInfo(null);

//   return (
//     <div>
//       <h2 className="text-xl font-bold mb-4">
//         Department Allowances (Stacked by Month)
//       </h2>

//       {/* Make parent relative so hover box positions correctly */}
//       <div className="relative">
//         <div style={{ height: "420px", overflow: "hidden" }}>
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart
//             data={chartData}
//             margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="department" />
//             <YAxis />
//             <Tooltip content={() => null} />
//             <Legend />

//             {months.map((month, idx) => (
//               <Bar key={month} dataKey={month} stackId="a">
//                 {chartData.map((entry, entryIdx) => (
//                   <Cell
//                     key={`cell-${entryIdx}`}
//                     fill={COLORS[idx % COLORS.length]}
//                     fillOpacity={
//                       hoverInfo?.month === month &&
//                       hoverInfo?.department === entry.department
//                         ? 0.7
//                         : 1
//                     }
//                     onMouseOver={() => handleHover(entry, month)}
//                     onMouseOut={clearHover}
//                   />
//                 ))}
//               </Bar>
//             ))}
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//         {/* Small Hover Box */}
//         {hoverInfo && (
//           <div
//             className="absolute bg-white shadow-lg border border-gray-300 p-2 rounded text-sm"
//             style={{ top: 10, left: 10, pointerEvents: "none", zIndex: 10 }}
//           >
//             <div>
//               <strong>Month:</strong> {hoverInfo.month}
//             </div>
//             <div>
//               <strong>Total Employees:</strong> {hoverInfo.employees.length}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Table */}
//       {hoverInfo && (
//         <div className="mt-6">
//           <h3 className="font-semibold mb-2">
//             {hoverInfo.department} – {hoverInfo.month}
//           </h3>

//           <table className="border-collapse border border-gray-300 w-full text-sm text-gray-700">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="border px-2 py-1">EmpID</th>
//                 <th className="border px-2 py-1">Name</th>
//                 <th className="border px-2 py-1">Allowance</th>
//               </tr>
//             </thead>
//             <tbody>
//               {hoverInfo.employees.map((emp, idx) => (
//                 <tr key={idx}>
//                   <td className="border px-2 py-1">{emp.EmpID}</td>
//                   <td className="border px-2 py-1">{emp.Name}</td>
//                   <td className="border px-2 py-1">{emp.Allowance}</td>
//                 </tr>
//               ))}

//               <tr className="font-bold bg-gray-200">
//                 <td className="border px-2 py-1">{hoverInfo.month} Total</td>
//                 <td className="border px-2 py-1"></td>
//                 <td className="border px-2 py-1">{hoverInfo.totalAllowance}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StackedBarChart;



