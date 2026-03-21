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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Brand Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box 
          component="img" 
          src="/logo.png" 
          sx={{ width: 40, height: 40, borderRadius: 1 }}
        />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color: 'primary.main' }}>
            ADARSHA
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1 }}>
            ERP SYSTEM
          </Typography>
        </Box>
      </Box>

      {/* Action Button */}
      {userRole === 'admin' && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<FiPlusCircle />}
            onClick={() => {
              onAddStudent();
              if (isMobile) onMobileClose();
            }}
            sx={{ 
              py: 1.5, 
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              '&:hover': { boxShadow: theme.shadows[8] }
            }}
          >
            New Admission
          </Button>
        </Box>
      )}

      <Divider sx={{ mx: 2, mb: 2, opacity: 0.5 }} />

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, px: 2 }}>
        <Typography variant="caption" sx={{ px: 2, mb: 1, display: 'block', color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
          Main Menu
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
                    py: 1.2,
                    backgroundColor: active ? 'primary.main' : 'transparent',
                    color: active ? 'common.white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: active ? 'primary.main' : 'rgba(79, 70, 229, 0.08)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: 'inherit', 
                    minWidth: 40,
                    fontSize: '1.2rem'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ 
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.95rem'
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
        <Divider sx={{ mb: 2, opacity: 0.5 }} />
        <ListItemButton
          onClick={onLogout}
          sx={{
            borderRadius: 2,
            color: 'error.main',
            '&:hover': { backgroundColor: 'error.lighter' }
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <FiLogOut />
          </ListItemIcon>
          <ListItemText primary="Sign Out" primaryTypographyProps={{ fontWeight: 600 }} />
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
