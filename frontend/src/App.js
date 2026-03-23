// src/App.js
import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import AddStudentFormPage from "./components/AddStudentModal";
import HomePage from "./components/HomePage";
import Notification from "./components/Notification";
import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CssBaseline from "@mui/material/CssBaseline";
import { login } from "./api";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate
} from "react-router-dom";

import LoginPage from "./components/LoginPage";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0F172A", // Deep Midnight Navy
      light: "#1E293B",
      dark: "#020617",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#10B981", // Emerald Green (Success/Growth)
      contrastText: "#ffffff",
    },
    info: {
      main: "#3B82F6", // Royal Blue
    },
    background: {
      default: "#F8FAFC", // Ultra-clean Slate
      paper: "#ffffff",
    },
    text: {
      primary: "#0F172A", 
      secondary: "#64748B", 
    }
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 800, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: "0.01em" }
  },
  shape: {
    borderRadius: 12, // Professional, crisp corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
          },
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E2E8F0',
        }
      }
    }
  }
});

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setLoggedIn(true);
  }, []);

  const showNotification = (message, type = '') => {
    setNotification({ message, type });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role"); // Added: Clear role on logout
    setLoggedIn(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <HomePage onAdmin={() => (window.location.href = "/login")} />
              }
            />
            <Route
              path="/login"
              element={
                loggedIn ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LoginPage 
                    onLogin={() => setLoggedIn(true)} 
                    showNotification={showNotification}
                  />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                loggedIn ? (
                  <Dashboard onLogout={handleLogout} showNotification={showNotification} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route 
              path="/add-student" 
              element={
                <AddStudentFormPage showNotification={showNotification} />
              } 
            />
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>

          {notification && (
            <Notification 
              message={notification.message}
              type={notification.type}
              onClose={closeNotification}
            />
          )}
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
