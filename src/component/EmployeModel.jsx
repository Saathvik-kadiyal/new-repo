import React, { useState } from "react";
import { useEmployeeData } from "../hooks/useEmployeeData";
const backendApi = import.meta.env.VITE_BACKEND_API;


const EmployeeModal = ({ employee, onClose, loading }) => {
const { setOnSave, getProcessedData, page } = useEmployeeData();
  const editableKeys = [
    "shift_a_days",
    "shift_b_days",
    "shift_c_days",
    "prime_days",
  ];
  const excludeKeys = ["id", "file_id"];

  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({ ...employee });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!employee && !loading) return null;


  const displayEntries = Object.entries(editableData || {}).filter(
    ([key]) => !excludeKeys.includes(key)
  );


  const handleChange = (key, value) => {
    setEditableData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {
    setEditableData({ ...employee });
    setIsEditing(false);
    setError("");
  };

const handleSave = async () => {
  try {
    setSaving(true);
    setError("");

    const payload = {
      shift_a_days: Number(editableData.shift_a_days) || 0,
      shift_b_days: Number(editableData.shift_b_days) || 0,
      shift_c_days: Number(editableData.shift_c_days) || 0,
      prime_days: Number(editableData.prime_days) || 0,
    };

    const token = localStorage.getItem("access_token");
    const response = await fetch(
      `${backendApi}/display/shift/partial-update/${employee.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) throw new Error("Failed to update employee shift data");

    const result = await response.json();

    setEditableData((prev) => ({
      ...prev,
      shift_a_days: result.shift_a_days ?? prev.shift_a_days,
      shift_b_days: result.shift_b_days ?? prev.shift_b_days,
      shift_c_days: result.shift_c_days ?? prev.shift_c_days,
      prime_days: result.prime_days ?? prev.prime_days,
      total_days: result.total_days ?? prev.total_days,
      total_days_allowance: result.total_days_allowance ?? prev.total_days_allowance,
    }));

    setOnSave(true);
    setIsEditing(false);
    setError("");

    if (getProcessedData) {
      await getProcessedData((page - 1) * 10, 10); 
    }

  } catch (err) {
    console.error(err);
    setError(err.message || "Something went wrong");
  } finally {
    setSaving(false);
  }
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
              if (isEditing) {
                handleCancel();
                onClose();
              } else {
                onClose();
              }
              if (isEditing);
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
              {displayEntries.map(([key, value]) => {
                const isFieldEditable = editableKeys.includes(key);

                return (
                  <div
                    key={key}
                    className="flex flex-col border border-gray-100 rounded-md p-2 bg-gray-50"
                  >
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/_/g, " ")}
                    </span>

                    {isEditing && isFieldEditable ? (
                      <input
                        type="number"
                        value={value || ""}
                        onChange={(e) =>
                          handleChange(key, Number(e.target.value))
                        }
                        min="0"
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    ) : (
                      <span
                        className={`text-gray-800 text-sm mt-1 ${
                          isEditing && !isFieldEditable
                            ? "opacity-70 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {String(value ?? "")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Error */}
            {error && (
              <div className="px-5 pb-2 text-sm text-red-600">{error}</div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 px-5 py-3 border-t">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
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
