import { useEffect, useState } from "react";
import DataTable from "../component/DataTable.jsx";
import {
  Box,
  Button,
  Typography,
  Stack,
  Modal,
  Paper,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";

import { useEmployeeData, UI_HEADERS } from "../hooks/useEmployeeData.jsx";

const FileInput = () => {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const {
    rows,
    setRows,
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
  } = useEmployeeData();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log(file)
    if (!file) return;
    setFileName(file.name);
    const token = localStorage.getItem("access_token");
    fetchDataFromBackend(file, token);
    setTimeout(() => setFileName(null), 3000);
  };

  useEffect(() => {
    if (errorFileLink) setErrorModalOpen(true);
  }, [errorFileLink]);

  useEffect(() => {
    if (success) getProcessedData(0, 10);
  }, [success]);

  const safeErrorRows = errorRows || [];

  return (
    <Box sx={{ width: "100%", pt: 2, pb: 4 }}  >
      <Typography variant="h5" fontWeight={600} mb={2}>
        Shift Allowance Data
      </Typography>

      <Stack direction="row" spacing={2} mb={3} alignItems="center">
       <Button variant="contained" component="label">
  Upload Excel
  <input
    type="file"
    hidden
    onClick={(e) => {
      e.target.value = null;
    }}
    onChange={(e) => {
      handleFileChange(e);
    }}
  />
</Button>

        <Box sx={{ flexGrow: 1 }} />
        <Button variant="outlined" onClick={downloadExcel}>
          Download Template
        </Button>
        {fileName && <Typography>{fileName}</Typography>}
      </Stack>

      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="success.main">{success}</Typography>}

      {/* 🔹 Error Modal */}
      <Modal
        open={errorModalOpen}
        onClose={(e) => {
          e.stopPrpagation()
          setErrorModalOpen(false);
          setErrorFileLink && setErrorFileLink(null);
        }}
      >
        <Paper
          sx={{
            width: "60%",
            maxWidth: 600,
            p: 3,
            mx: "auto",
            mt: "10vh",
            overflow: "auto",
            position: "relative",
            borderRadius: 2,
          }}
        >
          <IconButton
            sx={{ position: "absolute", right: 12, top: 12 }}
            onClick={() => {
              setErrorModalOpen(false);
              setErrorFileLink && setErrorFileLink(null);
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" mb={2}>
            File Upload Errors
          </Typography>

          <Stack direction="column" spacing={2} mb={2}>
            {safeErrorRows.length > 0 && (
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    navigate("/shift-allowance/edit", { state: { errorRows: safeErrorRows } });
                    setErrorModalOpen(false);
                  }}
                >
                  Edit
                </Button>
                {errorFileLink && (
                  <Button
                    variant="outlined"
                    onClick={() => downloadErrorExcel(errorFileLink)}
                  >
                    Download Error File
                  </Button>
                )}
              </Stack>
            )}
          </Stack>
        </Paper>
      </Modal>

      {/* 🔹 Data Table */}
      <DataTable
        headers={UI_HEADERS}
        rows={rows || []}
        totalRecords={totalRecords || 0}
        fetchPage={getProcessedData}
      />
    </Box>
  );
};

export default FileInput;
