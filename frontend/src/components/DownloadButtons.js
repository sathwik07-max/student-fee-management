// src/components/DownloadButtons.js
import React from "react";
import { Button, Stack, useTheme, alpha } from "@mui/material";
import { FiDownload, FiDatabase, FiFileText } from "react-icons/fi";
import { downloadExcel, downloadFilteredExcel, backupDatabase } from "../api";

export default function DownloadButtons({ filteredStudents }) {
  const theme = useTheme();

  const handleFilteredExport = () => {
    downloadFilteredExcel(filteredStudents);
  };

  const buttonStyle = {
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: 700,
    px: 3,
    py: 1,
    boxShadow: 'none',
    '&:hover': {
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
    }
  };

  return (
    <Stack direction="row" spacing={1.5}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<FiFileText />}
        onClick={downloadExcel}
        sx={{
          ...buttonStyle,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        }}
      >
        Export All
      </Button>

      <Button
        variant="outlined"
        color="primary"
        startIcon={<FiDownload />}
        onClick={handleFilteredExport}
        sx={{
          ...buttonStyle,
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            bgcolor: alpha(theme.palette.primary.main, 0.05)
          }
        }}
      >
        Export Filtered
      </Button>

      <Button
        variant="contained"
        color="secondary"
        startIcon={<FiDatabase />}
        onClick={backupDatabase}
        sx={{
          ...buttonStyle,
          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
          color: 'white'
        }}
      >
        System Backup
      </Button>
    </Stack>
  );
}
