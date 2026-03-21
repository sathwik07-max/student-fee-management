// src/components/AdmissionsList.js
import React, { useState, useEffect } from "react";
import { 
  fetchAdmissions, 
  downloadAdmissionPdf,
  downloadAdmissionsExcel 
} from "../api";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  alpha,
  useTheme,
  CircularProgress,
  Stack,
  Pagination,
  Grid
} from "@mui/material";
import { 
  FiSearch, 
  FiFileText, 
  FiPrinter, 
  FiDownload,
  FiCalendar,
  FiFilter
} from "react-icons/fi";

export default function AdmissionsList() {
  const theme = useTheme();
  const [admissions, setAdmissions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  
  // Date Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadAdmissions = () => {
    setLoading(true);
    fetchAdmissions({ start_date: startDate, end_date: endDate })
      .then((data) => {
        setAdmissions(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAdmissions();
  }, [startDate, endDate]);

  useEffect(() => {
    const s = search.toLowerCase();
    const result = admissions.filter(
      (a) =>
        (a.student && a.student.name.toLowerCase().includes(s)) ||
        (a.student && a.student.id_no && a.student.id_no.toLowerCase().includes(s)) ||
        (a.adm_no && a.adm_no.toLowerCase().includes(s))
    );
    setFiltered(result);
    setPage(1);
  }, [search, admissions]);

  const handleDownload = () => {
    downloadAdmissionsExcel({ start_date: startDate, end_date: endDate });
  };

  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box>
      {/* Search and Filters Header */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by Name, ID or Adm No..."
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              type="date"
              label="From Date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              type="date"
              label="To Date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={<FiDownload />}
                onClick={handleDownload}
                sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
              >
                Download Yearly Admissions
              </Button>
              <Button
                variant="outlined"
                startIcon={<FiFilter />}
                onClick={() => { setStartDate(""); setEndDate(""); }}
                sx={{ borderRadius: 2 }}
              >
                Reset
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
          {startDate && endDate ? `Showing admissions from ${startDate} to ${endDate}` : "Showing current academic year admissions"}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Total: {filtered.length} students
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Adm No</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Father Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Adm Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((a) => {
                const hasForm = a.adm_no !== "N/A";
                return (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      <Chip 
                        label={a.adm_no} 
                        size="small" 
                        color={hasForm ? "primary" : "default"}
                        variant={hasForm ? "filled" : "outlined"}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {a.student ? a.student.name : "N/A"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {a.student ? a.student.id_no : "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>{a.student ? a.student.father_name : "N/A"}</TableCell>
                    <TableCell>
                      <Chip label={a.class_medium} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {a.date_of_adm}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<FiFileText />}
                          onClick={() => downloadAdmissionPdf(a.student.id_no)}
                          disabled={!a.student || !a.student.id_no}
                          sx={{ borderRadius: 1.5 }}
                        >
                          View Form
                        </Button>
                        <IconButton 
                          size="small" 
                          color="primary"
                          title="Print Admission"
                          sx={{ border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.2) }}
                        >
                          <FiPrinter />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                      No matching records found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination 
              count={Math.ceil(filtered.length / rowsPerPage)} 
              page={page} 
              onChange={(_, val) => setPage(val)}
              color="primary"
              shape="rounded"
            />
          </Box>
        </TableContainer>
      )}
    </Box>
  );
}
