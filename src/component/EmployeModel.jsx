const EmployeeModal = ({ employee, headers, onClose }) => {
  console.log("EmployeeModal rendered with:", employee);
  if (!employee) return null;

  return (
    <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Employee Details – {employee["Emp Name"] || "N/A"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          {headers.map((header) => (
            <div key={header}>
              <p className="text-xs text-gray-500 font-medium">{header}</p>
              <p
                className="text-sm text-gray-800 truncate"
                title={employee[header] || ""}
              >
                {employee[header] || "-"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
