import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";
import MouritechImg from "../assets/logoo.png";


const backendApi = import.meta.env.VITE_BACKEND_API;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${backendApi}/auth/login`, {
        email,
        password,
      });

      const { access_token, refresh_token, token_type, user_id } =
        response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("email", email);
      localStorage.setItem("isLoggedIn", "true");

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Login failed. Please check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
  sx={{
    display: "flex",
    flexDirection:"column",
    justifyContent: "center",
    gap:"20px",
    alignItems: "center",
    height: "100vh",
    backgroundImage: `url(${MouritechImg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
  <Typography variant="h2" className="text-white">
    ShiftAllowance Tracker
  </Typography>

      <Paper
        elevation={4}
        sx={{
          p: 5,
          width: "100%",
          maxWidth: 400,
          borderRadius: 3,
          textAlign: "center",
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(6px)",
        }}>
        
        <Typography variant="h5" fontWeight={600} mb={2}>
          Sign in to your account
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Use your registered email and password
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            type="email"
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            required
            type="password"
            label="Password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{
              py: 1.2,
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
