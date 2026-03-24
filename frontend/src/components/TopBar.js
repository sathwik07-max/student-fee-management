// src/components/TopBar.js
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  InputBase,
  Avatar,
  Badge,
  useTheme,
  alpha
} from "@mui/material";
import { 
  FiMenu, 
  FiSearch, 
  FiBell, 
  FiUser 
} from "react-icons/fi";

export default function TopBar({ user, onSearch, onMenuToggle }) {
  const theme = useTheme();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
        zIndex: theme.zIndex.drawer + 1,
        backdropFilter: 'blur(8px)',
        bgcolor: 'rgba(255,255,255,0.8)'
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 }, minHeight: { xs: 64, md: 72 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuToggle}
            sx={{ display: { md: "none" }, bgcolor: 'background.default', borderRadius: 2 }}
          >
            <FiMenu />
          </IconButton>
          
          {/* Mobile-only Logo */}
          <Box 
            sx={{ 
              width: 36, height: 36, 
              display: { xs: 'flex', md: 'none' },
              bgcolor: 'primary.main',
              borderRadius: 1.5,
              alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Box component="img" src="/logo.png" sx={{ width: 20, height: 20 }} />
          </Box>

          {/* Desktop Search */}
          <Box
            sx={{
              position: "relative",
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.text.primary, 0.04),
              "&:hover": {
                backgroundColor: alpha(theme.palette.text.primary, 0.06),
                boxShadow: '0 0 0 2px ' + alpha(theme.palette.secondary.main, 0.1)
              },
              mr: 2,
              ml: 0,
              width: { xs: "0", sm: "360px" },
              display: { xs: "none", sm: "block" },
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              border: '1px solid transparent',
              '&:focus-within': {
                backgroundColor: '#ffffff',
                borderColor: 'secondary.main',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)'
              }
            }}
          >
            <Box sx={{ p: "0 16px", height: "100%", position: "absolute", display: "flex", alignItems: "center", color: 'text.secondary' }}>
              <FiSearch />
            </Box>
            <InputBase
              placeholder="Search students, classes, or IDs..."
              onChange={(e) => onSearch(e.target.value)}
              sx={{
                color: "inherit",
                width: "100%",
                fontSize: '0.875rem',
                fontWeight: 500,
                "& .MuiInputBase-input": {
                  p: "12px 12px 12px 48px",
                },
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
          <IconButton sx={{ display: { xs: 'flex', sm: 'none' }, bgcolor: 'background.default' }}>
             <FiSearch />
          </IconButton>
          
          <IconButton sx={{ bgcolor: 'background.default', borderRadius: 2, p: 1.25 }}>
            <Badge 
              badgeContent={4} 
              color="error"
              sx={{ '& .MuiBadge-badge': { fontWeight: 800, border: '2px solid #fff' } }}
            >
              <FiBell size={20} />
            </Badge>
          </IconButton>

          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1.5, 
              ml: 1,
              p: 0.5,
              pr: 1.5,
              borderRadius: 4,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'background.default' },
              transition: 'all 0.2s'
            }}
          >
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: 'secondary.main',
                fontWeight: 800,
                fontSize: '0.9rem',
                boxShadow: '0 4px 8px rgba(99, 102, 241, 0.2)'
              }}
            >
              {user ? user.charAt(0).toUpperCase() : 'A'}
            </Avatar>
            <Box sx={{ textAlign: "left", display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2, color: 'text.primary' }}>
                {user || "Administrator"}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'secondary.main', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                Super Admin
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
