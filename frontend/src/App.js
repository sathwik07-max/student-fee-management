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
      main: "#4f46e5", // Indigo 600
      light: "#818cf8",
      dark: "#3730a3",
    },
    secondary: {
      main: "#0ea5e9", // Sky 500
    },
    background: {
      default: "#f8fafc", // Slate 50
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b", // Slate 800
      secondary: "#64748b", // Slate 500
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
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
