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
  FiTrendingUp,
  FiAlertOctagon
} from "react-icons/fi";
import { GiNuclearBomb } from "react-icons/gi";

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
    { id: "alumni", label: "Alumni Records", icon: <FiUsers />, adminOnly: true },
    { id: "admissions", label: "Admissions", icon: <FiFileText />, adminOnly: true },
    { id: "feeconfig", label: "Fee Configuration", icon: <FiDollarSign />, adminOnly: true },
    { id: "promotion", label: "Academic & Data", icon: <FiTrendingUp />, adminOnly: true },
    { id: "teachers", label: "Staff Management", icon: <FiShield />, adminOnly: true },
    { id: "analytics", label: "Finance & Reports", icon: <FiPieChart />, adminOnly: true },
    { id: "logs", label: "Audit Logs", icon: <FiDatabase />, adminOnly: true },
    { id: "system", label: "System & Maintenance", icon: <FiSettings />, adminOnly: true },
    { id: "danger", label: "Danger Zone", icon: <GiNuclearBomb />, adminOnly: true, color: '#FF4444' },
  ];

  const filteredItems = menuItems.filter(item => 
    !item.adminOnly || userRole === 'admin' || username === 'admin'
  );

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'primary.main', color: 'white' }}>
      {/* Brand Header */}
      <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box 
          sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: 2, 
            bgcolor: 'secondary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
          }}
        >
          <Box 
            component="img" 
            src="/logo.png" 
            sx={{ width: 24, height: 24 }}
          />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', color: 'white' }}>
            ADARSHA
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            ERP System
          </Typography>
        </Box>
      </Box>

      {/* Action Button */}
      {userRole === 'admin' && (
        <Box sx={{ px: 3, mb: 4 }}>
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
              py: 1.5, 
              borderRadius: 3,
              fontWeight: 800,
              fontSize: '0.875rem',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 24px rgba(99, 102, 241, 0.4)',
              }
            }}
          >
            New Admission
          </Button>
        </Box>
      )}

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, px: 2, overflowY: 'auto', '&::-webkit-scrollbar': { width: 0 } }}>
        <Typography variant="caption" sx={{ px: 2, mb: 2, display: 'block', color: 'rgba(255,255,255,0.3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.7rem' }}>
          Main Menu
        </Typography>
        <List sx={{ p: 0 }}>
          {filteredItems.map((item) => {
            const active = activeTab === item.id;
            const isDanger = item.id === 'danger';
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.75 }}>
                <ListItemButton
                  onClick={() => {
                    setActiveTab(item.id);
                    if (isMobile) onMobileClose();
                  }}
                  sx={{
                    borderRadius: 3,
                    py: 1.25,
                    px: 2,
                    backgroundColor: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: active ? 'white' : 'rgba(255,255,255,0.6)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': active ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      bottom: '20%',
                      width: 4,
                      borderRadius: '0 4px 4px 0',
                      bgcolor: 'secondary.main',
                    } : {},
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      '& .MuiListItemIcon-root': { color: 'white' }
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: active ? 'secondary.main' : 'inherit', 
                    minWidth: 38,
                    fontSize: '1.25rem',
                    transition: 'color 0.2s'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ 
                      fontWeight: active ? 700 : 600,
                      fontSize: '0.9rem',
                      letterSpacing: '0.01em'
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer Profile */}
      <Box sx={{ p: 2, mt: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Box sx={{ 
          p: 2, 
          mb: 1, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          bgcolor: 'rgba(255,255,255,0.03)',
          borderRadius: 3
        }}>
          <Box 
            sx={{ 
              width: 36, 
              height: 36, 
              borderRadius: '50%', 
              bgcolor: 'secondary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.8rem'
            }}
          >
            {username ? username.charAt(0).toUpperCase() : 'A'}
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {username || "Admin"}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>
              {userRole === 'admin' ? 'Super Admin' : 'Staff Member'}
            </Typography>
          </Box>
        </Box>
        
        <ListItemButton
          onClick={onLogout}
          sx={{
            borderRadius: 3,
            color: '#FDA4AF',
            py: 1,
            '&:hover': { 
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              color: '#FF4D4D'
            }
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>
            <FiLogOut />
          </ListItemIcon>
          <ListItemText primary="Sign Out" primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }} />
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
