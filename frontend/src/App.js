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
      main: "#6EB5FF", // Sky Blue
      light: "#A0D1FF",
      dark: "#4A90E2",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#FFD93D", // Sunshine Yellow
      contrastText: "#2D3E50",
    },
    success: {
      main: "#9ADE7B", // Mint Green
    },
    background: {
      default: "#FFFDF0", // Light Cream
      paper: "#ffffff",
    },
    text: {
      primary: "#2D3E50", // Soft Navy
      secondary: "#5A7184", 
    }
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, fontFamily: '"Plus Jakarta Sans", sans-serif' },
    h2: { fontWeight: 800, fontFamily: '"Plus Jakarta Sans", sans-serif' },
    h3: { fontWeight: 800, fontFamily: '"Plus Jakarta Sans", sans-serif' },
    h4: { fontWeight: 800, fontFamily: '"Plus Jakarta Sans", sans-serif' },
    h5: { fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif' },
    h6: { fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif' },
    button: { fontWeight: 800, textTransform: 'none' }
  },
  shape: {
    borderRadius: 32,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(110, 181, 255, 0.3)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 15px 35px rgba(110, 181, 255, 0.12)',
          border: '4px solid rgba(110, 181, 255, 0.05)',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 32,
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
