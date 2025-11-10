import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import EmployeeModal from "./EmployeModel";

const DataTable = ({ headers, rows }) => {
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const totalPages = Math.ceil(rows.length / limit);
  const skip = (page - 1) * limit;
  const paginatedRows = useMemo(() => rows.slice(skip, skip + limit), [rows, skip, limit]);

  const handleIndividualEmploye = (employee) => {
    setSelectedEmployee(employee);
    setModelOpen(true);
  };

  const handleIndividualDownload = () => {
    const jsonData = Array.isArray(selectedEmployee) ? selectedEmployee : [selectedEmployee];
    try {
      const worksheet = XLSX.utils.json_to_sheet(jsonData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, "IndividualEmployeeAllowanceData.xlsx");
    } catch (error) {
      console.error("Excel generation failed:", error);
    }
  };

  return (
    <div className="relative max-h-[500px] overflow-y-auto overflow-x-hidden border border-gray-300 rounded-lg shadow-sm">
      <table
        className={`w-full border-collapse text-sm text-gray-800 transition-all duration-300 ${
          modelOpen ? "blur-sm pointer-events-none overflow-hidden" : ""
        }`}
      >
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index + 1}
                className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {paginatedRows.length > 0 ? (
            paginatedRows.map((row, index) => (
              <tr
                key={index}
                onClick={() => handleIndividualEmploye(row)}
                className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
              >
                {headers.map((header) => (
                  <td
                    key={header}
                    className="border border-gray-200 px-4 py-2 text-gray-700 max-w-[180px] truncate"
                    title={row[header]}
                  >
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="text-center py-4 text-gray-500 italic"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50 sticky bottom-0">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Rows per page:</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:ring-1 focus:ring-blue-400"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1 text-sm text-gray-700 border rounded-md disabled:opacity-50 hover:bg-gray-100"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="px-2 py-1 text-sm text-gray-700 border rounded-md disabled:opacity-50 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>

      {modelOpen && (
  <EmployeeModal
    employee={selectedEmployee}
    headers={headers}
    onClose={() => setModelOpen(false)}
  />
)}

    </div>
  );
};

export default DataTable;
