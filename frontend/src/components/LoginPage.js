// src/components/LoginPage.js
import React, { useState } from "react";
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment, 
  IconButton, 
  Alert, 
  CircularProgress,
  useTheme,
  alpha,
  Container,
  Fade
} from "@mui/material";
import { FiUser, FiLock, FiEye, FiEyeOff, FiShield } from "react-icons/fi";
import { login as apiLogin } from "../api";
import "./LoginPage.css";

export default function LoginPage({ onLogin, showNotification }) {
  const theme = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiLogin(username, password);
      if (data.success && data.token) {
        // Successful login - data is already saved to localStorage in api.js
        if (showNotification) showNotification("🎉 Welcome back! Login successful!", "success");
        setLoading(false);
        onLogin(); 
      } else {
        setLoading(false);
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setLoading(false);
      setError("Server connection failed. Please contact IT support.");
    }
  };

  return (
    <Box className="login-wrapper">
      <Container maxWidth="sm">
        <Fade in={true} timeout={800}>
          <Paper 
            elevation={24} 
            sx={{ 
              p: { xs: 4, sm: 6 }, 
              borderRadius: 5,
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: "blur(10px)",
              textAlign: "center",
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.1)
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                width: 80, height: 80, 
                bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                borderRadius: 4, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                mx: "auto",
                mb: 3,
                boxShadow: `0 8px 16px ${alpha(theme.palette.secondary.main, 0.2)}`,
                transform: 'rotate(-5deg)'
              }}>
                <FiShield size={40} color={theme.palette.secondary.main} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 1, letterSpacing: '-0.03em' }}>
                Admin Portal
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Sign in to manage your institution
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ color: 'text.disabled' }}>
                        <FiUser size={20} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3.5 } }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ color: 'text.disabled' }}>
                        <FiLock size={20} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="medium"
                          sx={{ color: 'text.disabled' }}
                        >
                          {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3.5 } }}
                />

                {error && (
                  <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ 
                    py: 1.8, 
                    borderRadius: 3, 
                    fontWeight: 800, 
                    fontSize: "1.1rem",
                    boxShadow: theme.shadows[8],
                    "&:hover": { transform: "translateY(-2px)", boxShadow: theme.shadows[12] },
                    transition: "all 0.2s"
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Login to Dashboard"}
                </Button>
              </Box>
            </form>

            <Box sx={{ mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account? <span style={{ color: theme.palette.primary.main, fontWeight: 700, cursor: 'pointer' }} onClick={() => alert("Contact System Admin for access.")}>Request Access</span>
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}
