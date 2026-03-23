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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      {/* Brand Header */}
      <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'background.default' }}>
        <Box 
          component="img" 
          src="/logo.png" 
          sx={{ width: 45, height: 45, borderRadius: 2, bgcolor: 'white', p: 0.5 }}
        />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color: 'primary.main', fontFamily: '"Bubblegum Sans", cursive', fontSize: '1.6rem' }}>
            ADARSHA
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: 1 }}>
            ERP SYSTEM
          </Typography>
        </Box>
      </Box>

      {/* Action Button */}
      {userRole === 'admin' && (
        <Box sx={{ px: 3, py: 3 }}>
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
              py: 2, 
              borderRadius: 50,
              fontSize: '1rem',
              boxShadow: '0 6px 0 #E5C12D',
              '&:hover': { boxShadow: '0 8px 0 #E5C12D', transform: 'translateY(-2px)' }
            }}
          >
            New Admission
          </Button>
        </Box>
      )}

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, px: 2 }}>
        <Typography variant="caption" sx={{ px: 3, mb: 2, display: 'block', color: 'primary.main', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>
          Main Menu
        </Typography>
        <List sx={{ p: 0 }}>
          {filteredItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => {
                    setActiveTab(item.id);
                    if (isMobile) onMobileClose();
                  }}
                  sx={{
                    borderRadius: 50,
                    py: 1.5,
                    px: 3,
                    backgroundColor: active ? 'primary.main' : 'transparent',
                    color: active ? 'common.white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: active ? 'primary.main' : 'background.default',
                      transform: 'translateX(5px)'
                    },
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: 'inherit', 
                    minWidth: 40,
                    fontSize: '1.4rem'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ 
                      fontWeight: 800,
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
      <Box sx={{ p: 3, mt: 'auto' }}>
        <ListItemButton
          onClick={onLogout}
          sx={{
            borderRadius: 50,
            py: 1.5,
            color: 'error.main',
            '&:hover': { backgroundColor: '#FFE3E3' }
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <FiLogOut />
          </ListItemIcon>
          <ListItemText primary="Sign Out" primaryTypographyProps={{ fontWeight: 800 }} />
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
