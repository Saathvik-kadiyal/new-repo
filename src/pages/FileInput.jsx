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
} from "@mui/material";

const FileInput = () => {
  const [searchState, setSearchState] = useState({ query: "", searchBy: "" });
  const [fileName, setFileName] = useState("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const {
    rows,
    loading,
    error,
    errorFileLink,
    setErrorFileLink,
    totalRecords,
    getProcessedData,
    fetchDataFromBackend,
    downloadExcel,
    downloadErrorExcel,
    success,
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
    if (success) getProcessedData(0, 10);
  }, [success]);

  return (
    <Box sx={{ width: "100%", pt: 2, pb:4 }}>
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
            sx={{ textTransform: "none", px: 2, py: 1  }}
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
          sx={{ textTransform: "none", px: 2, py: 1  }}
          color="success"
        >
          {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Download Template"}
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

      <Modal open={errorModalOpen} onClose={() => setErrorModalOpen(false)}>
        <Box
          component={Paper}
          sx={{
            width: 450,
            p: 4,
            mx: "auto",
            mt: "15vh",
            borderRadius: 2,
            outline: "none",
          }}
        >
          <Typography variant="h6" fontWeight={600} mb={2}>
            File Upload Errors
          </Typography>
          <Typography variant="body2" mb={3}>
            Some rows could not be processed. Please download the error file
            for details.
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="contained"
              color="warning"
              sx={{ textTransform: "none" }}
              onClick={() => {
                downloadErrorExcel(errorFileLink);
                setErrorModalOpen(false);
                setTimeout(()=>{
setErrorFileLink(null)
                },2000)
              }}
            >
              Download Error File
            </Button>

            <Button
              variant="outlined"
              sx={{ textTransform: "none" }}
              onClick={() => {setErrorModalOpen(false)
                setTimeout(()=>{
setErrorFileLink(null)
                },2000)
              }}
            >
              Close
            </Button>
          </Stack>
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
