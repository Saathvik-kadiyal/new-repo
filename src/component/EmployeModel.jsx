import React from "react";

const EmployeeModal = ({ employee, onClose, loading }) => {
  if (!employee && !loading) return null;

  const excludeKeys = ["id", "file_id"];

  const displayEntries = Object.entries(employee || {}).filter(
    ([key]) => !excludeKeys.includes(key)
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[650px] max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3 border-b">
          <h2 className="text-lg font-semibold">Employee Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✖
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500 text-base">
            Loading employee details...
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 gap-3">
            {displayEntries.map(([key, value]) => (
              <div
                key={key}
                className="flex flex-col border border-gray-100 rounded-md p-2 bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="text-gray-800 text-sm wrap-break-word">
                  {String(value || "")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeModal;
