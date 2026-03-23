// src/components/Sidebar.js
import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Button,
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  FiHome,
  FiUsers,
  FiDollarSign,
  FiPieChart,
  FiSettings,
  FiLogOut,
  FiPlusCircle,
  FiDatabase,
  FiFileText,
  FiGrid,
  FiShield,
  FiTrendingUp
} from "react-icons/fi";

const drawerWidth = 280;

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  onAddStudent,
  mobileOpen,
  onMobileClose
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const userRole = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: <FiGrid /> },
    { id: "students", label: "Student List", icon: <FiUsers /> },
    { id: "admissions", label: "Admissions", icon: <FiFileText />, adminOnly: true },
    { id: "feeconfig", label: "Fee Configuration", icon: <FiDollarSign />, adminOnly: true },
    { id: "promotion", label: "Academic & Data", icon: <FiTrendingUp />, adminOnly: true },
    { id: "teachers", label: "Staff Management", icon: <FiShield />, adminOnly: true },
    { id: "analytics", label: "Finance & Reports", icon: <FiPieChart />, adminOnly: true },
    { id: "logs", label: "Audit Logs", icon: <FiDatabase />, adminOnly: true },
    { id: "system", label: "System & Maintenance", icon: <FiSettings />, adminOnly: true },
  ];

  const filteredItems = menuItems.filter(item => 
    !item.adminOnly || userRole === 'admin' || username === 'admin'
  );

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'primary.main', color: 'white' }}>
      {/* Brand Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box 
          component="img" 
          src="/logo.png" 
          sx={{ width: 32, height: 32, borderRadius: 1 }}
        />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>
            ADARSHA
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: '0.1em' }}>
            ERP SYSTEM
          </Typography>
        </Box>
      </Box>

      {/* Action Button */}
      {userRole === 'admin' && (
        <Box sx={{ px: 2, py: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            startIcon={<FiPlusCircle />}
            onClick={() => {
              onAddStudent();
              if (isMobile) onMobileClose();
            }}
            sx={{ 
              py: 1.25, 
              borderRadius: 2,
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
            }}
          >
            New Admission
          </Button>
        </Box>
      )}

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, px: 1.5 }}>
        <Typography variant="caption" sx={{ px: 2, mb: 1.5, display: 'block', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Navigation
        </Typography>
        <List sx={{ p: 0 }}>
          {filteredItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    setActiveTab(item.id);
                    if (isMobile) onMobileClose();
                  }}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: active ? 'secondary.main' : 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'white'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: 'inherit', 
                    minWidth: 36,
                    fontSize: '1.2rem'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ 
                      fontWeight: active ? 700 : 600,
                      fontSize: '0.875rem'
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <ListItemButton
          onClick={onLogout}
          sx={{
            borderRadius: 2,
            color: '#FDA4AF',
            '&:hover': { backgroundColor: 'rgba(244, 63, 94, 0.1)' }
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
            <FiLogOut />
          </ListItemIcon>
          <ListItemText primary="Sign Out" primaryTypographyProps={{ fontWeight: 700, fontSize: '0.875rem' }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '4px 0 24px rgba(0,0,0,0.02)'
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
