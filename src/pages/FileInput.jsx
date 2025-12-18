import { useEffect, useState } from "react";
import DataTable from "../component/DataTable.jsx";
import { Tooltip } from "@mui/material";
import { useEmployeeData, UI_HEADERS } from "../hooks/useEmployeeData.jsx";
 
import {
  Box,
  Button,
  Typography,
  Stack,
  Modal,
  Paper,
  CircularProgress,
  IconButton,
  TextField,
} from "@mui/material";
 
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import PushPinIcon from "@mui/icons-material/PushPin";
 
const FileInput = () => {
  const [searchState, setSearchState] = useState({ query: "", searchBy: "" });
  const [fileName, setFileName] = useState("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);
 
  const [editMode, setEditMode] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
 
  const {
    rows,
    loading,
    error,
    errorFileLink,
    setErrorFileLink,
    errorRows,
    totalRecords,
    getProcessedData,
    fetchDataFromBackend,
    downloadExcel,
    downloadErrorExcel,
    success,
    token,
  } = useEmployeeData();
 
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    fetchDataFromBackend(file);
    setTimeout(() => {
      setFileName(null);
    }, 3000);
  };
 
  useEffect(() => {
    if (errorFileLink) setErrorModalOpen(true);
  }, [errorFileLink]);
 
  useEffect(() => {
    if (success) getProcessedData(0, 10);
  }, [success]);
 
  const handleSave = async () => {
    if (!editRow) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/employee/${editRow.emp_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editRow),
        }
      );
      const data = await response.json();
      if (data.errors) setFieldErrors(data.errors);
      else {
        setEditRow(null);
        setEditMode(false);
        setFieldErrors({});
        getProcessedData(0, 10);
      }
    } catch (err) {
      console.error(err);
    }
  };
 
  return (
    <Box sx={{ width: "100%", pt: 2, pb: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={2} color="text.primary">
        Shift Allowance Data
      </Typography>
 
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title="Upload an Excel file">
            <Button
              variant="contained"
              component="label"
              sx={{ textTransform: "none", px: 2, py: 1 }}
            >
              Upload Excel
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                hidden
                onChange={handleFileChange}
              />
            </Button>
          </Tooltip>
          {fileName && (
            <Typography variant="body2" color="text.secondary">
              {fileName}
            </Typography>
          )}
        </Stack>
        <Tooltip title="Download sample Excel format">
          <Button
            variant="outlined"
            size="small"
            disabled={loading}
            onClick={downloadExcel}
            sx={{ textTransform: "none", px: 2, py: 1 }}
            color="success"
          >
            {loading ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Download Template"
            )}
          </Button>
        </Tooltip>
      </Stack>
 
      {success && (
        <Typography color="success.main" mb={1} fontWeight={500}>
          {success}
        </Typography>
      )}
 
      {loading && (
        <Typography color="primary.main" mb={1}>
          Loading...
        </Typography>
      )}
 
      {error && (
        <Typography color="error.main" mb={1}>
          {error}
        </Typography>
      )}
 
      {/* ----------------- Error Modal ----------------- */}
      <Modal open={errorModalOpen} onClose={() => setErrorModalOpen(false)}>
        <Box
          component={Paper}
          sx={{
            width: 700,
            maxHeight: "80vh",
            overflowY: "auto",
            p: 4,
            mx: "auto",
            mt: "10vh",
            borderRadius: 2,
            position: "relative",
            outline: "none",
          }}
        >
          <IconButton
            sx={{ position: "absolute", top: 8, right: 8 }}
            onClick={() => {
              setErrorModalOpen(false);
              setErrorFileLink(null);
            }}
          >
            <CloseIcon />
          </IconButton>
 
          <Typography variant="h6" fontWeight={600} mb={2}>
            File Upload Errors
          </Typography>
          <Typography variant="body2" mb={3}>
            Some rows could not be processed. Please download the error file for
            details.
          </Typography>
 
          {!editMode && (
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="contained"
                color="warning"
                startIcon={<EditIcon />}
                sx={{ textTransform: "none" }}
                onClick={() => setEditMode(true)}
              >
                Edit
              </Button>
 
              <Button
                variant="outlined"
                sx={{ textTransform: "none" }}
                onClick={() => {
                  downloadErrorExcel(errorFileLink);
                  setErrorModalOpen(false);
                  setTimeout(() => {
                    setErrorFileLink(null);
                  }, 2000);
                }}
              >
                Download Error File
              </Button>
            </Stack>
          )}
 
          {editMode && (
            <Box sx={{ mt: 2 }}>
              {errorRows.map((row, idx) => (
                <Box
                  key={idx}
                  sx={{ mb: 2, border: "1px solid #ccc", p: 2, borderRadius: 1 }}
                >
                  <Stack direction="row" alignItems="center" mb={1}>
                    <Typography sx={{ flex: 1 }}>Emp ID: {row.emp_id}</Typography>
                    <IconButton onClick={() => setEditRow({ ...row })}>
                      <PushPinIcon />
                    </IconButton>
                  </Stack>
 
                  {editRow && editRow.emp_id === row.emp_id && (
                    <Box>
                      {Object.keys(row).map((field) => {
                        if (field === "id" || field === "emp_id") return null;
                        return (
                          <TextField
                            key={field}
                            label={field}
                            value={editRow[field]}
                            onChange={(e) =>
                              setEditRow((prev) => ({
                                ...prev,
                                [field]: e.target.value,
                              }))
                            }
                            fullWidth
                            margin="dense"
                            error={!!fieldErrors[field]}
                            helperText={fieldErrors[field] || ""}
                          />
                        );
                      })}
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 1 }}
                        onClick={handleSave}
                      >
                        Save
                      </Button>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Modal>
 
      <DataTable
        headers={UI_HEADERS}
        rows={rows}
        totalRecords={totalRecords}
        fetchPage={getProcessedData}
        onSearchChange={(s) => setSearchState(s)}
      />
    </Box>
  );
};
 
export default FileInput;