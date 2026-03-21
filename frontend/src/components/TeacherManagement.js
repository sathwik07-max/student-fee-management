import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Avatar, 
  Button, 
  Chip, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Checkbox, 
  ListItemText, 
  OutlinedInput,
  Switch,
  Tooltip,
  Divider,
  Stack,
  alpha,
  useTheme,
  CircularProgress
} from "@mui/material";
import { 
  FiUserPlus, 
  FiShield, 
  FiTrash2, 
  FiEdit3, 
  FiLock, 
  FiCheckCircle, 
  FiXCircle,
  FiBookOpen,
  FiActivity
} from "react-icons/fi";
import { 
  fetchTeachers, 
  createTeacher, 
  updateTeacher, 
  deleteTeacher,
  fetchClassrooms 
} from "../api";

export default function TeacherManagement({ showNotification }) {
  const theme = useTheme();
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    class_ids: [],
    can_collect_fees: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, cData] = await Promise.all([fetchTeachers(), fetchClassrooms()]);
      setTeachers(tData);
      setClasses(cData);
    } catch (err) {
      showNotification("Failed to load staff data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.username || !formData.password) {
      showNotification("Please fill all required fields", "error");
      return;
    }
    try {
      const res = await createTeacher(formData);
      if (res.success) {
        showNotification("Teacher account created successfully", "success");
        setOpenAdd(false);
        setFormData({ username: "", password: "", class_ids: [], can_collect_fees: false });
        loadData();
      } else {
        showNotification(res.error, "error");
      }
    } catch (err) {
      showNotification("Error creating account", "error");
    }
  };

  const toggleStatus = async (teacher) => {
    try {
      const res = await updateTeacher(teacher.id, { is_active: !teacher.is_active });
      if (res.success) {
        showNotification(`Access ${!teacher.is_active ? 'Granted' : 'Revoked'}`, "success");
        loadData();
      }
    } catch (err) {
      showNotification("Update failed", "error");
    }
  };

  const toggleFeePermission = async (teacher) => {
    try {
      const res = await updateTeacher(teacher.id, { can_collect_fees: !teacher.can_collect_fees });
      if (res.success) {
        showNotification(`Fee Collection ${!teacher.can_collect_fees ? 'Enabled' : 'Disabled'} for ${teacher.username}`, "success");
        loadData();
      }
    } catch (err) {
      showNotification("Update failed", "error");
    }
  };

  const handleUpdateClasses = async () => {
    try {
      const res = await updateTeacher(selectedTeacher.id, { class_ids: formData.class_ids });
      if (res.success) {
        showNotification("Class assignments updated", "success");
        setOpenEdit(false);
        loadData();
      }
    } catch (err) {
      showNotification("Assignment failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff account? This action cannot be undone.")) {
      try {
        const res = await deleteTeacher(id);
        if (res.success) {
          showNotification("Staff account deleted", "success");
          loadData();
        }
      } catch (err) {
        showNotification("Delete failed", "error");
      }
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FiShield style={{ color: theme.palette.primary.main }} /> Staff Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage teacher accounts and their assigned classroom permissions
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<FiUserPlus />} 
          onClick={() => setOpenAdd(true)}
          sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 700 }}
        >
          Add New Staff
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {teachers.map((teacher) => (
            <Grid item xs={12} md={6} lg={4} key={teacher.id}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: 4, 
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
                    transform: 'translateY(-4px)'
                  },
                  opacity: teacher.is_active ? 1 : 0.7,
                  bgcolor: teacher.is_active ? 'background.paper' : alpha(theme.palette.action.disabledBackground, 0.3)
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 56, height: 56, 
                        bgcolor: teacher.is_active ? 'primary.main' : 'text.disabled',
                        fontWeight: 700, fontSize: '1.2rem'
                      }}
                    >
                      {teacher.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                        {teacher.username}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: teacher.is_active ? 'success.main' : 'error.main', fontWeight: 700 }}>
                        {teacher.is_active ? <FiCheckCircle /> : <FiXCircle />}
                        {teacher.is_active ? "Active Access" : "Access Denied"}
                      </Typography>
                    </Box>
                  </Box>
                  <Stack alignItems="center">
                    <Tooltip title={teacher.is_active ? "Deactivate Account" : "Activate Account"}>
                      <Switch 
                        checked={teacher.is_active} 
                        onChange={() => toggleStatus(teacher)} 
                        color="primary"
                        size="small"
                      />
                    </Tooltip>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>LOGIN</Typography>
                  </Stack>
                </Box>

                <Box sx={{ mb: 2, p: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.warning.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                   <Box>
                      <Typography variant="caption" fontWeight={800} color="warning.dark" display="block">FEE COLLECTION</Typography>
                      <Typography variant="caption" color="text.secondary">Allow recording payments</Typography>
                   </Box>
                   <Switch 
                      checked={teacher.can_collect_fees} 
                      onChange={() => toggleFeePermission(teacher)}
                      color="warning"
                   />
                </Box>

                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <FiBookOpen /> ASSIGNED CLASSROOMS
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                    {teacher.assigned_classes.map((cls) => (
                      <Chip 
                        key={cls.id} 
                        label={cls.name} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontWeight: 600, borderRadius: 1.5, borderColor: alpha(theme.palette.primary.main, 0.2), bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                      />
                    ))}
                    {teacher.assigned_classes.length === 0 && (
                      <Typography variant="body2" color="text.disabled" fontStyle="italic">
                        No classes assigned
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                  <Button 
                    fullWidth 
                    size="small" 
                    variant="soft" 
                    startIcon={<FiEdit3 />}
                    onClick={() => {
                      setSelectedTeacher(teacher);
                      setFormData({ ...formData, class_ids: teacher.assigned_classes.map(c => c.id) });
                      setOpenEdit(true);
                    }}
                    sx={{ 
                      borderRadius: 2, 
                      fontWeight: 700,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                    }}
                  >
                    Manage
                  </Button>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDelete(teacher.id)}
                    sx={{ borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) } }}
                  >
                    <FiTrash2 />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ADD STAFF DIALOG */}
      <Dialog 
        open={openAdd} 
        onClose={() => setOpenAdd(false)}
        PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 450 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FiUserPlus style={{ color: theme.palette.primary.main }} /> Create Staff Account
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Username"
              placeholder="e.g. math_teacher_1"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              InputProps={{ startAdornment: <FiUserPlus style={{ marginRight: 8, opacity: 0.5 }} /> }}
            />
            <TextField
              fullWidth
              label="Temporary Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              InputProps={{ startAdornment: <FiLock style={{ marginRight: 8, opacity: 0.5 }} /> }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Initial Class Assignment</InputLabel>
              <Select
                multiple
                value={formData.class_ids}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.includes('all')) {
                    if (formData.class_ids.length === classes.length) {
                      setFormData({ ...formData, class_ids: [] });
                    } else {
                      setFormData({ ...formData, class_ids: classes.map(c => c.id) });
                    }
                    return;
                  }
                  setFormData({...formData, class_ids: value});
                }}
                input={<OutlinedInput label="Initial Class Assignment" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={classes.find(c => c.id === value)?.name} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="all">
                  <Checkbox 
                    checked={formData.class_ids.length === classes.length && classes.length > 0} 
                    indeterminate={formData.class_ids.length > 0 && formData.class_ids.length < classes.length}
                  />
                  <ListItemText primary="SELECT ALL CLASSES" sx={{ '& .MuiListItemText-primary': { fontWeight: 800, color: 'primary.main' } }} />
                </MenuItem>
                <Divider />
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    <Checkbox checked={formData.class_ids.indexOf(cls.id) > -1} />
                    <ListItemText primary={cls.name} secondary={cls.section} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.warning.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="warning.dark">Fee Collection Rights</Typography>
                  <Typography variant="caption" color="text.secondary">Allow this user to record payments</Typography>
               </Box>
               <Switch 
                  checked={formData.can_collect_fees} 
                  onChange={(e) => setFormData({...formData, can_collect_fees: e.target.checked})}
                  color="warning"
               />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAdd(false)} color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}>
            Create Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT PERMISSIONS DIALOG */}
      <Dialog 
        open={openEdit} 
        onClose={() => setOpenEdit(false)}
        PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 450 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FiEdit3 style={{ color: theme.palette.primary.main }} /> Manage Permissions
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3, textAlign: 'center', pt: 2 }}>
            <Avatar 
              sx={{ width: 64, height: 64, mx: 'auto', mb: 1, bgcolor: 'primary.main', fontWeight: 700 }}
            >
              {selectedTeacher?.username.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6" fontWeight={700}>{selectedTeacher?.username}</Typography>
            <Typography variant="caption" color="text.secondary">Select classes this staff member can manage</Typography>
          </Box>

          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Assigned Classrooms</InputLabel>
            <Select
              multiple
              value={formData.class_ids}
              onChange={(e) => {
                const value = e.target.value;
                if (value.includes('all')) {
                  if (formData.class_ids.length === classes.length) {
                    setFormData({ ...formData, class_ids: [] });
                  } else {
                    setFormData({ ...formData, class_ids: classes.map(c => c.id) });
                  }
                  return;
                }
                setFormData({...formData, class_ids: value});
              }}
              input={<OutlinedInput label="Assigned Classrooms" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={classes.find(c => c.id === value)?.name} size="small" color="primary" variant="soft" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="all">
                <Checkbox 
                  checked={formData.class_ids.length === classes.length && classes.length > 0} 
                  indeterminate={formData.class_ids.length > 0 && formData.class_ids.length < classes.length}
                />
                <ListItemText primary="SELECT ALL CLASSES" sx={{ '& .MuiListItemText-primary': { fontWeight: 800, color: 'primary.main' } }} />
              </MenuItem>
              <Divider />
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  <Checkbox checked={formData.class_ids.indexOf(cls.id) > -1} />
                  <ListItemText primary={cls.name} secondary={cls.section || 'General'} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2, border: '1px dashed', borderColor: alpha(theme.palette.info.main, 0.2) }}>
             <Typography variant="caption" color="info.main" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <FiActivity /> PERMISSION SCOPE
             </Typography>
             <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                Assigned staff can view student lists, record fee payments, and update basic profiles for students in these specific classrooms.
             </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenEdit(false)} color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleUpdateClasses} variant="contained" sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}>
            Save Assignments
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
