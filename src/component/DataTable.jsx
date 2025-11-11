import EmployeeModal from "./EmployeModel.jsx";
import { useEmployeeData } from "../hooks/useEmployeeData.jsx"; 

const DataTable = ({ headers, rows, totalRecords, fetchPage }) => {
  const {
    modelOpen,
    setModelOpen,
    selectedEmployee,
    loadingDetail,
    error,
    page,
    totalPages,
    handlePageChange,
    handleIndividualEmployee,
    EXPORT_HEADERS
  } = useEmployeeData(fetchPage, totalRecords);



  return (
    <div className="relative max-h-[500px] overflow-y-auto overflow-x-hidden border border-gray-300 rounded-lg shadow-sm">
      {error && (
        <div className="p-2 text-center text-red-600 bg-red-50 border-b border-red-200">
          {error}
        </div>
      )}

      <table className="w-full border-collapse text-sm text-gray-800">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows?.length > 0 ? (
            rows.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => {
                  console.log("Row clicked:", row);
                  handleIndividualEmployee(row.id)
                  setModelOpen(true)
                 
                }}
                className="hover:bg-gray-50 cursor-pointer"
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
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

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

      {modelOpen && selectedEmployee && (
  <EmployeeModal
    employee={selectedEmployee}
    headers={EXPORT_HEADERS}
    onClose={() => setModelOpen(false)}
    loading={loadingDetail}
  />
)}
    </div>
  );
};

export default DataTable;
