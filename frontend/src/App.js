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
      main: "#0F172A", // Slate 900
      light: "#1E293B", // Slate 800
      dark: "#020617", // Slate 950
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#6366F1", // Indigo 500 (Modern Primary)
      light: "#818CF8",
      dark: "#4F46E5",
      contrastText: "#ffffff",
    },
    success: {
      main: "#10B981", // Emerald 500
      light: "#34D399",
      dark: "#059669",
    },
    error: {
      main: "#EF4444", // Red 500
      light: "#F87171",
      dark: "#DC2626",
    },
    warning: {
      main: "#F59E0B", // Amber 500
      light: "#FBBF24",
      dark: "#D97706",
    },
    info: {
      main: "#3B82F6", // Blue 500
      light: "#60A5FA",
      dark: "#2563EB",
    },
    background: {
      default: "#F8FAFC", // Slate 50
      paper: "#ffffff",
    },
    text: {
      primary: "#0F172A", 
      secondary: "#64748B", 
      disabled: "#94A3B8",
    },
    divider: "#E2E8F0",
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "system-ui", sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A" },
    h2: { fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A" },
    h3: { fontWeight: 700, letterSpacing: "-0.02em", color: "#0F172A" },
    h4: { fontWeight: 700, letterSpacing: "-0.02em", color: "#0F172A" },
    h5: { fontWeight: 600, letterSpacing: "-0.01em", color: "#0F172A" },
    h6: { fontWeight: 600, letterSpacing: "-0.01em", color: "#0F172A" },
    subtitle1: { fontWeight: 600, color: "#1E293B" },
    subtitle2: { fontWeight: 600, color: "#64748B" },
    body1: { fontSize: "1rem", lineHeight: 1.6, color: "#334155" },
    body2: { fontSize: "0.875rem", lineHeight: 1.57, color: "#64748B" },
    button: { fontWeight: 700, textTransform: "none", letterSpacing: "0.01em" },
    caption: { fontWeight: 600, letterSpacing: "0.01em" }
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(15, 23, 42, 0.05)',
    '0px 4px 6px -1px rgba(15, 23, 42, 0.1), 0px 2px 4px -1px rgba(15, 23, 42, 0.06)',
    '0px 10px 15px -3px rgba(15, 23, 42, 0.1), 0px 4px 6px -2px rgba(15, 23, 42, 0.05)',
    '0px 20px 25px -5px rgba(15, 23, 42, 0.1), 0px 10px 10px -5px rgba(15, 23, 42, 0.04)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    ...Array(19).fill('none')
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedSecondary: {
          backgroundColor: "#6366F1",
          '&:hover': {
            backgroundColor: "#4F46E5",
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.05), 0px 1px 2px rgba(15, 23, 42, 0.06)',
          border: '1px solid #E2E8F0',
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 6px -1px rgba(15, 23, 42, 0.1), 0px 2px 4px -1px rgba(15, 23, 42, 0.06)',
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F1F5F9',
          padding: '16px',
        },
        head: {
          backgroundColor: '#F8FAFC',
          color: '#64748B',
          fontWeight: 700,
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: 'none',
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #E2E8F0',
          boxShadow: 'none',
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
