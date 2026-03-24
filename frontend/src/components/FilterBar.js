import React from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  InputAdornment,
  useTheme,
  alpha,
  Typography,
  IconButton,
  Tooltip
} from "@mui/material";
import { 
  FiSearch, 
  FiFilter, 
  FiRotateCcw, 
  FiMapPin, 
  FiBookOpen, 
  FiTruck, 
  FiHome,
  FiHash,
  FiUser
} from "react-icons/fi";

export default function FilterBar({
  search, setSearch,
  searchId, setSearchId,
  selectedClass, setSelectedClass,
  classes,
  selectedVillage, setSelectedVillage,
  villages,
  selectedBus, setSelectedBus,
  buses,
  hostel, setHostel,
  dueMin, setDueMin,
  dueMax, setDueMax,
  resetFilters
}) {
  const theme = useTheme();

  return (
    <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{ 
          p: 1, 
          borderRadius: 2, 
          bgcolor: alpha(theme.palette.secondary.main, 0.1), 
          color: 'secondary.main',
          display: 'flex'
        }}>
          <FiFilter size={20} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.1rem' }}>
          Search & Filters
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Reset all filters">
          <Button 
            onClick={resetFilters}
            variant="outlined" 
            color="inherit" 
            startIcon={<FiRotateCcw />}
            sx={{ 
              borderRadius: 2, 
              fontWeight: 700, 
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': { bgcolor: 'background.default', borderColor: 'text.secondary' }
            }}
          >
            Reset
          </Button>
        </Tooltip>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Student Name"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ color: 'text.disabled' }}>
                  <FiUser />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="ID Number"
            placeholder="Search ID..."
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ color: 'text.disabled' }}>
                  <FiHash />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
            <InputLabel id="class-label">Class</InputLabel>
            <Select
              labelId="class-label"
              value={selectedClass}
              label="Class"
              onChange={e => setSelectedClass(e.target.value)}
              startAdornment={
                <InputAdornment position="start" sx={{ color: 'text.disabled', mr: 0.5 }}>
                  <FiBookOpen />
                </InputAdornment>
              }
            >
              {classes.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2.5}>
          <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
            <InputLabel id="village-label">Village</InputLabel>
            <Select
              labelId="village-label"
              value={selectedVillage}
              label="Village"
              onChange={e => setSelectedVillage(e.target.value)}
              startAdornment={
                <InputAdornment position="start" sx={{ color: 'text.disabled', mr: 0.5 }}>
                  <FiMapPin />
                </InputAdornment>
              }
            >
              {villages.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2.5}>
          <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
            <InputLabel id="bus-label">Bus Route</InputLabel>
            <Select
              labelId="bus-label"
              value={selectedBus}
              label="Bus Route"
              onChange={e => setSelectedBus(e.target.value)}
              startAdornment={
                <InputAdornment position="start" sx={{ color: 'text.disabled', mr: 0.5 }}>
                  <FiTruck />
                </InputAdornment>
              }
            >
              {buses.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
            <InputLabel id="hostel-label">Residence</InputLabel>
            <Select
              labelId="hostel-label"
              value={hostel}
              label="Residence"
              onChange={e => setHostel(e.target.value)}
              startAdornment={
                <InputAdornment position="start" sx={{ color: 'text.disabled', mr: 0.5 }}>
                  <FiHome />
                </InputAdornment>
              }
            >
              <MenuItem value="All">All Students</MenuItem>
              <MenuItem value="Hosteler">Hostelers</MenuItem>
              <MenuItem value="Dayscholar">Dayscholars</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2.5}>
          <TextField
            fullWidth
            type="number"
            label="Min Due"
            placeholder="0"
            value={dueMin}
            onChange={e => setDueMin(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ color: 'text.disabled' }}>₹</InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.5}>
          <TextField
            fullWidth
            type="number"
            label="Max Due"
            placeholder="∞"
            value={dueMax}
            onChange={e => setDueMax(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ color: 'text.disabled' }}>₹</InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
