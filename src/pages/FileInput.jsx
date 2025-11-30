import { useEffect, useState } from "react";
import DataTable from "../component/DataTable.jsx";
import { useEmployeeData, UI_HEADERS } from "../hooks/useEmployeeData.jsx";

const FileInput = () => {
  const [searchState, setSearchState] = useState({ query: "", searchBy: "" });
  const [fileName, setFileName] = useState("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const {
    rows,
    loading,
    error,
    errorFileLink,
    totalRecords,
    getProcessedData,
    fetchDataFromBackend,
    downloadExcel,
    downloadErrorExcel,
    success
  } = useEmployeeData();

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setFileName(file.name);
  fetchDataFromBackend(file); 
};


  useEffect(() => {
  if (errorFileLink) setErrorModalOpen(true);
}, [errorFileLink]);
useEffect(() => {
  if (success) {
    getProcessedData(0, 10);
  }
}, [success]);


  return (
    <div className="w-full justify-center pt-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Employee Data Upload
      </h2>

      <div className="flex items-center gap-3 mb-6 flex-wrap justify-between">
        <div className="flex gap-2 items-center">
          <label
            htmlFor="file-upload"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white text-[12px] font-medium rounded-lg shadow-md cursor-pointer hover:bg-blue-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition-all duration-150"
          >
            Upload Excel
          </label>

          <input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden cursor-pointer"
          />
        </div>

        <button
  onClick={() => downloadExcel(searchState)}
  disabled={loading}
  className={`cursor-pointer inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg shadow-md transition-all duration-150 ${
    loading
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white text-[12px] focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
  }`}
>
  {rows.length === 0 ? "Download Template" : "Download Data"}
</button>



      </div>
{success && (
  <p className="text-green-600 text-sm mb-2 font-medium">
    {success}
  </p>
)}

      {loading && <p className="text-blue-500 text-sm mb-2">Loading...</p>}
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {/* Error Modal */}
      {errorModalOpen && errorFileLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg relative">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              File Upload Errors
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Some rows could not be processed. Please download the error file
              for details.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  downloadErrorExcel(errorFileLink);
                  setErrorModalOpen(false);
                }}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all duration-150"
              >
                Download Error File
              </button>
              <button
                onClick={() => setErrorModalOpen(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-150"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <DataTable
  headers={UI_HEADERS}
  rows={rows}
  totalRecords={totalRecords}
  fetchPage={getProcessedData}
  onSearchChange={(s) => setSearchState(s)}
/>

    </div>
  );
};

export default FileInput;
