import React, { useState } from "react";

const EmployeeModal = ({ employee, onClose, onSave, loading }) => {
  if (!employee && !loading) return null;

  const excludeKeys = ["id", "file_id"];
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({ ...employee });

  const displayEntries = Object.entries(editableData || {}).filter(
    ([key]) => !excludeKeys.includes(key)
  );

  const handleChange = (key, value) => {
    setEditableData({ ...editableData, [key]: value });
  };

  const handleSave = () => {
    if (onSave) onSave(editableData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableData({ ...employee });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[650px] max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3 border-b">
          <h2 className="text-lg font-semibold">
            {isEditing ? "Edit Employee Details" : "Employee Details"}
          </h2>
          <button
            onClick={() => {
              if (isEditing) handleCancel();
              else onClose();
            }}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✖
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-base">
            Loading employee details...
          </div>
        ) : (
          <>
            {/* Body */}
            <div className="p-4 grid grid-cols-2 gap-3">
              {displayEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex flex-col border border-gray-100 rounded-md p-2 bg-gray-50"
                >
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/_/g, " ")}
                  </span>

                  {isEditing ? (
                    <input
                      type="text"
                      value={value || ""}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  ) : (
                    <span className="text-gray-800 text-sm wrap-break-word mt-1">
                      {String(value || "")}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-5 py-3 border-t">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeModal;
