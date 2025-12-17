import React, { useState, useEffect } from "react";
import { updateEmployeeShift } from "../utils/helper";
import { Box, Button, IconButton, Typography, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const SHIFT_KEYS = ["A", "B", "C", "PRIME"];
const UI_LABEL = { A: "Shift A", B: "Shift B", C: "Shift C", PRIME: "Prime" };

const EmployeeModal = ({ employee, onClose }) => {
  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Initialize modal data when employee prop changes
  useEffect(() => {
    if (employee) {
      setData(employee);
      setIsEditing(false);
      setError("");
      setSuccess("");
    }
  }, [employee]);

  if (!employee || !data) return null;

  // Update shift values
  const updateShift = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const resetChanges = () => {
    setData(employee);
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  // Handle save
  const handleSave = async () => {
    if (!data) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) throw new Error("No auth token found");

      const payload = {
        shift_a: String(data.A || 0),
        shift_b: String(data.B || 0),
        shift_c: String(data.C || 0),
        prime: String(data.PRIME || 0),
      };

      await updateEmployeeShift(token, data.emp_id, data.duration_month, data.payroll_month, payload);

      setIsEditing(false);
      setSuccess("Shift updated successfully ✅");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update shift");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3"
      onClick={() => { resetChanges(); onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-[760px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Box display="flex" justifyContent="flex-end" p={2}>
          <IconButton onClick={() => { resetChanges(); onClose(); }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Modal Content */}
        <Box px={4} pb={4}>
          <Typography variant="h6" mb={2}>Employee ID: {data.emp_id}</Typography>

          <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
            {SHIFT_KEYS.map((key) => (
              <Box key={key} sx={{ p: 2, border: "1px solid #ccc", borderRadius: 1, flex: "1 1 120px" }}>
                <Typography fontWeight={600}>{UI_LABEL[key]}</Typography>
                {isEditing ? (
                  <TextField
                    type="number"
                    size="small"
                    value={data[key] ?? ""}
                    onChange={(e) => updateShift(key, e.target.value)}
                    fullWidth
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Typography mt={1}>{data[key]}</Typography>
                )}
              </Box>
            ))}
          </Box>

          {error && <Typography color="error" mb={2}>{error}</Typography>}
          {success && <Typography color="success.main" mb={2}>{success}</Typography>}

          {/* Action Buttons */}
          <Box mt={3} display="flex" gap={2}>
            {isEditing ? (
              <>
                <Button variant="outlined" onClick={resetChanges}>Cancel</Button>
                <Button variant="contained" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button variant="contained" color="warning" onClick={() => setIsEditing(true)}>Edit</Button>
            )}
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default EmployeeModal;
