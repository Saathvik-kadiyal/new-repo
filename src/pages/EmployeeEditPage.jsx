import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Modal,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";


import CloseIcon from "@mui/icons-material/Close";
import * as XLSX from "xlsx";
import { correctEmployeeRows, toBackendMonthFormat } from "../utils/helper";

const BACKEND_TO_FRONTEND = {
  emp_id: "EMP ID",
  emp_name: "EMP NAME",
  grade: "GRADE",
  department: "DEPARTMENT",
  client: "CLIENT",
  project: "PROJECT",
  project_code: "PROJECT CODE",
};

const HIDDEN_FIELDS = ["reason"];
const isHiddenField = (key) => HIDDEN_FIELDS.includes(key);

const EmployeeEditPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [errorRows, setErrorRows] = useState(state?.errorRows || []);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (selectedEmployee) {
      console.log("Selected employee reason fields:", selectedEmployee.reason);
    }
  }, [selectedEmployee]);
  const handleSave = async () => {
    if (!selectedEmployee) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      setSaveSuccess("You are not authenticated. Please login again.");
      return;
    }

    try {
      const correctedRow = { ...selectedEmployee };

      console.log("Corrected Row being sent to API:", correctedRow);

      const data = await correctEmployeeRows(token, [correctedRow]);

      console.log("API Response:", data);


      if (data?.message) {
        setSaveSuccess(`EMP ID: ${correctedRow.emp_id} saved successfully ✅`);

        const updatedErrors = errorRows.filter(
          (r) => r.emp_id !== correctedRow.emp_id
        );

        setErrorRows(updatedErrors);
        setSelectedEmployee(null);

        return;
      }

    } catch (err) {
      console.error("Save error caught:", err);

      const errorMsg =
        err?.detail?.failed_rows?.[0]?.reason ||
        err?.message ||
        "Unknown";

      setSaveSuccess(
        `Failed to save EMP ID: ${selectedEmployee.emp_id} - ${errorMsg}`
      );
    }

    setTimeout(() => setSaveSuccess(""), 5000);
  };


  const handleDownloadErrorRows = () => {
    if (!errorRows || errorRows.length === 0) return;

    const cleanedRows = errorRows.map(({ reason, ...rest }) => rest);

    const worksheet = XLSX.utils.json_to_sheet(cleanedRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Error Rows");

    XLSX.writeFile(workbook, "Remaining_Error_Rows.xlsx");
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Breadcrumb */}
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs>
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/shift-allowance")}
          >
            Shift Allowance
          </Link>
          <Typography color="text.primary">Error Records</Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Error Records
        </Typography>

        <Button
          variant="outlined"
          onClick={handleDownloadErrorRows}
          disabled={errorRows.length === 0}
        >
          Download Error Rows
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#000",
                "& th": {
                  backgroundColor: "#000",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "1px solid #444",
                },
              }}
            >
              {Object.keys(errorRows[0] || {})
                .filter((key) => !isHiddenField(key))
                .map((key) => (
                  <TableCell key={key} sx={{ fontWeight: "bold" }}>
                    {BACKEND_TO_FRONTEND[key] || key.toUpperCase()}
                  </TableCell>
                ))}
              <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {errorRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography color="success.main" fontWeight="bold">
                    All rows successfully edited ✅
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              errorRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, idx) => (
                  <TableRow key={idx} hover>
                    {Object.keys(row)
                      .filter((key) => !isHiddenField(key))
                      .map((key) => (
                        <TableCell
                          key={key}
                          sx={{
                            border: "1px solid #ddd",
                            color: row.reason && row.reason[key] ? "red" : "inherit", 
                            fontWeight: row.reason && row.reason[key] ? "bold" : "normal",
                          }}
                        >
                          {row[key] ?? "-"}
                        </TableCell>
                      ))}
                    <TableCell>

                      <IconButton
                        onClick={() => {
                          setSelectedEmployee(row); 
                          setSaveSuccess("");        
                        }}
                      >
                        <PushPinOutlinedIcon />
                      </IconButton>

                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>

        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={errorRows.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Modal */}
      <Modal
        open={!!selectedEmployee}
        BackdropProps={{
          style: { backgroundColor: "rgba(0,0,0,0.5)" },
          onClick: (e) => e.stopPropagation(),
        }}
      >
        <Paper
          sx={{
            width: "70%",
            maxWidth: 900,
            maxHeight: "80vh",
            p: 3,
            mx: "auto",
            mt: "10vh",
            overflowY: "auto",
            borderRadius: 2,
          }}
        >
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Employee Details – EMP ID: {selectedEmployee?.emp_id}
            </Typography>
            <IconButton
              onClick={() => {
                setSelectedEmployee(null);
                setSaveSuccess("");
              }}
            >
              <CloseIcon />
            </IconButton>

          </Box>

          <Typography fontWeight="bold" mb={1}>
            Edit Error Fields
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            {selectedEmployee &&
              Object.entries(selectedEmployee).map(([key, value]) => {
                if (isHiddenField(key) || key in selectedEmployee.reason) return null;
                return (
                  <Paper key={key} sx={{ p: 2, flex: "1 1 calc(45% - 12px)" }}>
                    <Typography fontWeight="bold">
                      {BACKEND_TO_FRONTEND[key] || key.toUpperCase()}
                    </Typography>
                    <Typography>{value ?? "-"}</Typography>
                  </Paper>
                );
              })}
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {selectedEmployee &&
              Object.keys(selectedEmployee.reason || {}).map((field) => (
                <Paper key={field} sx={{ p: 2, flex: "1 1 45%" }}>
                  <Typography fontWeight="bold">
                    {field.replace(/_/g, " ").toUpperCase()}
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={selectedEmployee[field] ?? ""}
                    onChange={(e) => {
                      setSelectedEmployee((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                    }
                    error={Boolean(selectedEmployee.reason[field])}
                    helperText={selectedEmployee.reason[field]}
                  />
                </Paper>
              ))}
          </Box>

          <Box mt={3} display="flex" gap={2}>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
            <Button variant="outlined" onClick={() => setSelectedEmployee(null)}>
              Back
            </Button>
          </Box>

          {saveSuccess && (
            <Typography
              mt={1}
              color={saveSuccess.includes("successfully") ? "success.main" : "error"}
            >
              {saveSuccess}
            </Typography>
          )}
        </Paper>
      </Modal>
    </Box>
  );
}

export default EmployeeEditPage;


