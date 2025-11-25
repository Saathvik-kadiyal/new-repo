import React, { useState, useEffect } from "react";
import { useEmployeeData } from "../hooks/useEmployeeData";
import { updateEmployeeShift } from "../utils/helper";

const SHIFT_KEYS = ["A", "B", "C", "PRIME"];
const UI_LABEL = {
  A: "Shift A",
  B: "Shift B",
  C: "Shift C",
  PRIME: "Prime",
};

const EmployeeModal = ({ employee, onClose, loading }) => {
  const { setOnSave } = useEmployeeData();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeMonthIndex, setActiveMonthIndex] = useState(0);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (employee) setData(employee);
  }, [employee]);

  if ((!employee && !loading) || !data) return null;

  const months = data.months || [];
  const activeMonth = months[activeMonthIndex] || {};

  const updateShift = (key, value) => {
    setData((prev) => {
      const updatedMonths = [...prev.months];
      updatedMonths[activeMonthIndex] = {
        ...updatedMonths[activeMonthIndex],
        [key]: value,
      };
      return { ...prev, months: updatedMonths };
    });
  };

  const resetChanges = () => {
    setData(employee);
    setIsEditing(false);
    setError("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("access_token");

      const payload = {
        shift_a: String(activeMonth.A || "0"),
        shift_b: String(activeMonth.B || "0"),
        shift_c: String(activeMonth.C || "0"),
        prime: String(activeMonth.PRIME || "0"),
      };

      const result = await updateEmployeeShift(employee.emp_id, activeMonth.payroll_month, payload, token);

      const updatedMonths = [...data.months];
      const updated = { ...updatedMonths[activeMonthIndex] };
      result.shift_details.forEach((item) => {
        updated[item.shift] = item.days;
      });
      updatedMonths[activeMonthIndex] = updated;
      setData((prev) => ({ ...prev, months: updatedMonths }));
      setIsEditing(false);
      setOnSave(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const excludeMonthKeys = ["id", "created_at", "updated_at"];

  return (
   <div
  className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
  onClick={() => {
    resetChanges();
    onClose();
  }}
>
  <div
    className="bg-white rounded-2xl shadow-2xl w-full max-w-[900px] max-h-[85vh] overflow-y-auto scrollbar-hidden animate-fadeIn"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="flex justify-end items-center px-6 py-4 rounded-t-2xl ">
      <button
        onClick={() => {
          resetChanges();
          onClose();
        }}
        className="text-gray-500 hover:text-red-500 transition text-xl"
      >
        ✖
      </button>
    </div>

    <div className="flex border-b px-6 bg-white sticky top-0 z-10">
      {months.map((m, i) => (
        <button
          key={i}
          onClick={() => setActiveMonthIndex(i)}
          className={`px-4 py-3 text-sm font-medium transition border-b-2 cursor-pointer
            ${
              activeMonthIndex === i
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
        >
          {m.payroll_month}
        </button>
      ))}
    </div>

    {/* Content */}
    <div className="p-5 space-y-4">
      {/* Employee Info */}
      <div className="grid grid-cols-2 gap-4 px-6">
        <div className="border p-3 bg-gray-50 rounded-lg shadow-sm">
          <p className="text-xs font-semibold text-gray-600">Employee ID</p>
          <p className="mt-1 text-sm text-gray-800">{data.emp_id}</p>
        </div>
        <div className="border p-3 bg-gray-50 rounded-lg shadow-sm">
          <p className="text-xs font-semibold text-gray-600">Employee Name</p>
          <p className="mt-1 text-sm text-gray-800">{data.emp_name}</p>
        </div>
      </div>

      {/* Month Details */}
      <div className="grid grid-cols-3 gap-4 px-6 py-4">
        {Object.entries(activeMonth)
          .filter(([k]) => !excludeMonthKeys.includes(k))
          .map(([k, v]) => (
            <div
              key={k}
              className="p-3 border bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <p className="text-sm font-semibold text-gray-700">
                {k.replace(/_/g, " ")}
              </p>
              {isEditing && SHIFT_KEYS.includes(k) ? (
                <input
                  type="number"
                  min="0"
                  max="22"
                  className="mt-2 border rounded-lg px-3 py-2 w-full text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={v ?? ""}
                  onChange={(e) => updateShift(k, e.target.value)}
                />
              ) : (
                <p className="mt-2 text-gray-800">{String(v)}</p>
              )}
            </div>
          ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3 pt-4 px-6">
        {isEditing ? (
          <>
            <button
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
              onClick={resetChanges}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        ) : (
          <button
            className="px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  </div>
</div>

  );
};

export default EmployeeModal;
