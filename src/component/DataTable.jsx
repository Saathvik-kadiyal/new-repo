import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeModal from "./EmployeModel.jsx";
import { useEmployeeData } from "../hooks/useEmployeeData.jsx";

const DataTable = ({ headers, totalRecords, fetchPage }) => {
  const {
    modelOpen,
    setModelOpen,
    selectedEmployee,
    loadingDetail,
    error,
    page,
    totalPages,
    rows,
    handlePageChange,
    handleIndividualEmployee,
  } = useEmployeeData(fetchPage, totalRecords);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [sortState, setSortState] = useState({ header: null, direction: null });
  
  const navigate = useNavigate();

  const sortableHeaders = ["Emp ID", "Emp Name", "Department", "Client"];

  const filteredAndSortedRows = useMemo(() => {
    let filtered = rows;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = rows.filter((row) =>
        headers.some((header) =>
          (row[header] || "").toString().toLowerCase().includes(q)
        )
      );
    }

    if (
      sortState.header &&
      sortState.direction &&
      sortState.direction !== "reset"
    ) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = ((a[sortState.header] || "") + "").toLowerCase().trim();
        const bVal = ((b[sortState.header] || "") + "").toLowerCase().trim();
        if (sortState.direction === "asc")
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        if (sortState.direction === "desc")
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        return 0;
      });
    }

    return filtered;
  }, [rows, searchQuery, sortState, headers]);

  // Sort change
  const handleSort = (header, direction) => {
    setSortState({ header, direction });
    setActiveMenu(null);
  };

  return (
    <div className="relative max-h-[500px] overflow-y-auto overflow-x-hidden border border-gray-300 rounded-lg shadow-sm">
      {error && (
        <div className="p-2 text-center text-red-600 bg-red-50 border-b border-red-200">
          {error}
        </div>
      )}

      <div className="p-3 border-b flex items-center gap-3 bg-gray-50 sticky top-0 z-20">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/3 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
        />
        <button
    onClick={() => {
      navigate("/client-summary", { state: { data: filteredAndSortedRows } });
    }}
    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
  >
    View Client Summary
  </button>
      </div>

      {/* Table */}
      <table className="w-full border-collapse text-sm text-gray-800">
        <thead className="bg-gray-100 sticky top-10 z-10">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap relative"
              >
                <div className="flex justify-between items-center">
                  <span>{header}</span>

                  {/* Sort Menu */}
                  {sortableHeaders.includes(header) && (
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setActiveMenu(activeMenu === header ? null : header)
                        }
                        className="px-1 py-0.5 text-gray-500 hover:text-gray-700 font-bold"
                      >
                        ⋮
                      </button>

                      {activeMenu === header && (
                        <div className="absolute right-0 mt-1 w-24 bg-white border border-gray-300 rounded shadow-lg z-30">
                          <ul className="text-sm">
                            <li
                              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleSort(header, "asc")}
                            >
                              A-Z
                            </li>
                            <li
                              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleSort(header, "desc")}
                            >
                              Z-A
                            </li>
                            <li
                              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleSort(header, "reset")}
                            >
                              Reset
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredAndSortedRows?.length > 0 ? (
            filteredAndSortedRows.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => {
                  handleIndividualEmployee(row.id);
                  setModelOpen(true);
                }}
                className={`cursor-pointer transition-colors duration-150 ${
                  row._isMatch
                    ? "bg-green-100 border-l-4 border-green-500"
                    : "hover:bg-gray-50"
                }`}
              >
                {headers.map((header) => (
                  <td
                    key={header}
                    className="border border-gray-200 px-4 py-2 text-gray-700 truncate"
                    title={row[header]}
                  >
                    {row[header] || ""}
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
                {searchQuery
                  ? `No matching records found for "${searchQuery}"`
                  : "No data available"}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination (unchanged) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center px-4 py-2 border-t bg-gray-50 sticky bottom-0">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-2 py-1 text-sm text-gray-700 border rounded-md disabled:opacity-50 hover:bg-gray-100"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600 mx-3">
            Page {page} of {totalPages || 1}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-2 py-1 text-sm text-gray-700 border rounded-md disabled:opacity-50 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {modelOpen && selectedEmployee && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={() => setModelOpen(false)}
          loading={loadingDetail}
        
        />
      )}
    </div>
  );
};

export default DataTable;
