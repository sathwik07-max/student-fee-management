import React, { useState, useEffect } from "react";
import { 
  fetchClassroomConfig, 
  updateClassroomFee, 
  fetchBusRoutes, 
  saveBusRoute, 
  deleteBusRoute 
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
  TextField,
  Button,
  IconButton,
  Grid,
  Divider,
  Stack,
  Alert,
  alpha,
  useTheme
} from "@mui/material";
import { 
  FiSettings, 
  FiTruck, 
  FiBook, 
  FiPlus, 
  FiTrash2, 
  FiSave,
  FiCheckCircle
} from "react-icons/fi";

export default function FeeSettings() {
  const theme = useTheme();
  const [classrooms, setClassrooms] = useState([]);
  const [busRoutes, setBusRoutes] = useState([]);
  const [newRoute, setNewRoute] = useState({ location: "", yearly: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "info" });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const [rooms, routes] = await Promise.all([fetchClassroomConfig(), fetchBusRoutes()]);
      
      // Ensure standard classes exist in the UI even if not in DB
      const standardClasses = ["Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
      const populatedRooms = standardClasses.map(className => {
        const existing = rooms.find(r => r.name === className);
        return existing || { name: className, section: "All", fee: 0, isNew: true };
      });

      setClassrooms(populatedRooms);
      setBusRoutes(routes);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleUpdateClassFee = async (name, section, fee) => {
    try {
      await updateClassroomFee(name, section, fee);
      setMessage({ text: `Fee updated for ${name}`, type: "success" });
      loadConfig();
    } catch (err) {
      setMessage({ text: "Failed to update class fee", type: "error" });
    }
  };

  const handleAddBusRoute = async () => {
    if (!newRoute.location || !newRoute.yearly) return;
    try {
      await saveBusRoute(newRoute.location, 0, newRoute.yearly);
      setNewRoute({ location: "", yearly: "" });
      setMessage({ text: "New bus route added", type: "success" });
      loadConfig();
    } catch (err) {
      setMessage({ text: "Failed to add bus route", type: "error" });
    }
  };

  const handleDeleteRoute = async (id) => {
    try {
      await deleteBusRoute(id);
      setMessage({ text: "Bus route removed", type: "success" });
      loadConfig();
    } catch (err) {
      setMessage({ text: "Failed to delete route", type: "error" });
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <FiSettings /> Master Fee Configuration
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMessage({ text: "", type: "info" })}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Class-wise Fees */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FiBook /> Class Tuition Fees (Annual)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Define the default yearly tuition fee for each class. New admissions will automatically use these values.
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Class Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Section</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tuition Fee (₹)</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classrooms.map((room) => (
                    <TableRow key={room.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{room.name}</TableCell>
                      <TableCell>{room.section || "All"}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          defaultValue={room.fee}
                          onBlur={(e) => handleUpdateClassFee(room.name, room.section, e.target.value)}
                          sx={{ width: 120 }}
                          InputProps={{ sx: { borderRadius: 2 } }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" size="small"><FiCheckCircle /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {classrooms.length === 0 && (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}>No classes found. Add a student first.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Bus Route Fees */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FiTruck /> Bus Route Fees (Annual)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Define the yearly bus fee for each location.
            </Typography>

            {/* Add New Route */}
            <Box sx={{ mb: 4, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3 }}>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Location Name"
                    size="small"
                    value={newRoute.location}
                    onChange={(e) => setNewRoute({ ...newRoute, location: e.target.value })}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Yearly Fee (₹)"
                    size="small"
                    type="number"
                    value={newRoute.yearly}
                    onChange={(e) => setNewRoute({ ...newRoute, yearly: e.target.value })}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button variant="contained" fullWidth onClick={handleAddBusRoute} sx={{ height: 40, borderRadius: 2 }}>
                    <FiPlus />
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Annual Fee (₹)</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {busRoutes.map((route) => (
                    <TableRow key={route.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{route.location}</TableCell>
                      <TableCell>₹{route.yearly.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <IconButton color="error" size="small" onClick={() => handleDeleteRoute(route.id)}>
                          <FiTrash2 />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {busRoutes.length === 0 && (
                    <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3 }}>No bus routes defined.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
