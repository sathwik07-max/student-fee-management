// src/components/DownloadPaymentsButton.js
import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  IconButton,
  Stack,
  useTheme,
  alpha
} from "@mui/material";
import { FiCalendar, FiDownload, FiX, FiActivity } from "react-icons/fi";
import { downloadPaymentsExcel } from "../api";

export default function DownloadPaymentsButton() {
  const theme = useTheme();
  const [show, setShow] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setError("");
    if (!start || !end) {
      setError("Please select both dates.");
      return;
    }
    
    setLoading(true);
    try {
        await downloadPaymentsExcel(start, end);
        setShow(false);
    } catch (err) {
        setError("Failed to download payments.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        startIcon={<FiCalendar />}
        onClick={() => setShow(true)}
        sx={{
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: 700,
          px: 3,
          py: 1,
          bgcolor: '#fbbf24',
          color: '#78350f',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: '#f59e0b',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
          }
        }}
      >
        Payment Reports
      </Button>

      <Dialog 
        open={show} 
        onClose={() => setShow(false)}
        PaperProps={{
          sx: { borderRadius: 3, padding: 1, maxWidth: 400 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            Export Payments
          </Typography>
          <IconButton onClick={() => setShow(false)} size="small">
            <FiX />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a date range to generate a detailed Excel report of all fee transactions.
          </Typography>
          
          <Stack spacing={2}>
            <TextField
              label="From Date"
              type="date"
              fullWidth
              value={start}
              onChange={(e) => setStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="To Date"
              type="date"
              fullWidth
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          {error && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
              {error}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={() => setShow(false)} 
            color="inherit" 
            sx={{ fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<FiDownload />}
            onClick={handleDownload}
            disabled={loading}
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              fontWeight: 700,
              boxShadow: theme.shadows[4]
            }}
          >
            {loading ? "Exporting..." : "Download Excel"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
