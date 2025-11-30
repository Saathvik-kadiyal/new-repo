import React, { useState, useEffect } from "react";
import { updateEmployeeShift } from "../utils/helper";
import { useEmployeeData } from "../hooks/useEmployeeData";

const SHIFT_KEYS = ["A", "B", "C", "PRIME"];
const UI_LABEL = { A: "Shift A", B: "Shift B", C: "Shift C", PRIME: "Prime" };

const EmployeeModal = ({ employee, onClose, loading }) => {
  const { setOnSave } = useEmployeeData();
  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (employee) setData(employee);
  }, [employee]);

  useEffect(() => {
  if (success) {
    const timer = setTimeout(() => setSuccess(""), 3000);
    return () => clearTimeout(timer);
  }
}, [success]);


  if ((!employee && !loading) || !data) return null;

  const updateShift = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
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
    setSuccess("");
    const token = localStorage.getItem("access_token");
    const payload = {
      shift_a: String(data.A || 0),
      shift_b: String(data.B || 0),
      shift_c: String(data.C || 0),
      prime: String(data.PRIME || 0),
    };

    await updateEmployeeShift(
      token,
      data.emp_id,
      data.duration_month,
      data.payroll_month,
      payload
    );

    setIsEditing(false);
    setOnSave(true);
    setSuccess("Shift updated successfully");
  } catch (err) {
    setError(err.message);
  } finally {
    setSaving(false);
  }
};


  const fieldsToShow = { ...data };
  ["A", "B", "C", "PRIME", "emp_id", "emp_name"].forEach((key) => delete fieldsToShow[key]);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3"
      onClick={() => {
        resetChanges();
        onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-[760px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end p-3">
          <button
            className="text-gray-500 hover:text-red-600 text-xl"
            onClick={() => {
              resetChanges();
              onClose();
            }}
          >
            ✖
          </button>
        </div>

        <div className="p-4 space-y-6">

          {/* Row 1 — Employee ID & Name */}
          <div className="grid grid-cols-2 gap-4">
            <Info label="Employee ID" value={data.emp_id} />
            <Info label="Employee Name" value={data.emp_name} />
          </div>

          {/* 3-column auto-wrap — All other fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(fieldsToShow).map(([key, value]) => (
              <Info key={key} label={formatLabel(key)} value={String(value) || "-"} />
            ))}
          </div>

          {/* Editable Shift Inputs */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            {SHIFT_KEYS.map((key) => (
              <div key={key} className="p-3 border rounded-lg bg-gray-50">
                <p className="text-xs font-semibold text-gray-700">{UI_LABEL[key]}</p>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    max="22"
                    value={data[key] ?? ""}
                    onChange={(e) => updateShift(key, e.target.value)}
                    className="mt-2 border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <p className="mt-2">{String(data[key])}</p>
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-lg text-red-600 text-center">{error}</p>}
{success && <p className="text-lg text-green-600 text-center">{success}</p>}


          <div className="flex justify-end gap-3 pt-3">
            {isEditing ? (
              <>
                <button className="px-4 py-2 border rounded-lg" onClick={resetChanges}>
                  Cancel
                </button>
                <button
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-300"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                className="px-5 py-2 bg-yellow-500 text-white rounded-lg"
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

const Info = ({ label, value }) => (
  <div className="border p-2 bg-gray-50 rounded-lg">
    <p className="text-[11px] font-semibold text-gray-600">{label}</p>
    <p className="mt-1 text-sm">{value}</p>
  </div>
);

const formatLabel = str =>
  str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default EmployeeModal;
