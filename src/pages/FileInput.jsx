import { useState } from "react";
import DataTable from "../component/DataTable.jsx";
import { useEmployeeData, UI_HEADERS } from "../hooks/useEmployeeData.jsx";


const FileInput = () => {
  const [fileName, setFileName] = useState("");

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
  } = useEmployeeData();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    fetchDataFromBackend(file);
  };

  return (
    <div className="p-6 w-full">
      

      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Employee Data Upload
      </h2>

      <div className="flex items-center gap-3 mb-6 flex-wrap justify-between">
        <div className="flex gap-2 items-center">
          <label
            htmlFor="file-upload"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md cursor-pointer hover:bg-blue-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition-all duration-150"
          >
            Upload Excel / CSV
          </label>

          <input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden cursor-pointer"
          />

          {/* <span
            className="text-gray-600 text-sm italic truncate max-w-xs"
            title={fileName}
          >
            {fileName ? `📄 ${fileName}` : "No file selected"}
          </span> */}
        </div>

        <button
          onClick={downloadExcel}
          disabled={loading}
          className={`cursor-pointer inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg shadow-md transition-all duration-150 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0 0l-3-3m3 3l3-3M12 4v8"
            />
          </svg>
          {rows.length === 0 ? "Download Template" : "Download Data"}
        </button>
      </div>

      {loading && <p className="text-blue-500 text-sm mb-2">Loading...</p>}
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {errorFileLink && (
        <div className="mb-4">
          <button
            onClick={downloadErrorExcel}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all duration-150"
          >
            Download Error File
          </button>
        </div>
      )}
      <DataTable
  headers={UI_HEADERS}
  rows={rows}
  totalRecords={totalRecords}
  fetchPage={getProcessedData}
/>

    </div>
  );
};

export default FileInput;
