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
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuToggle}
            sx={{ display: { md: "none" } }}
          >
            <FiMenu />
          </IconButton>
          
          {/* Mobile-only Logo */}
          <Box 
            component="img" 
            src="/logo.png" 
            sx={{ width: 32, height: 32, display: { xs: 'block', md: 'none' } }}
          />

          {/* Desktop Search */}
          <Box
            sx={{
              position: "relative",
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.text.primary, 0.05),
              "&:hover": {
                backgroundColor: alpha(theme.palette.text.primary, 0.08),
              },
              mr: 2,
              ml: 0,
              width: { xs: "0", sm: "300px" },
              display: { xs: "none", sm: "block" },
              transition: "all 0.2s ease"
            }}
          >
            <Box sx={{ p: "0 16px", height: "100%", position: "absolute", display: "flex", alignItems: "center" }}>
              <FiSearch />
            </Box>
            <InputBase
              placeholder="Search students..."
              onChange={(e) => onSearch(e.target.value)}
              sx={{
                color: "inherit",
                width: "100%",
                "& .MuiInputBase-input": {
                  p: "8px 8px 8px 48px",
                },
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 3 } }}>
          <IconButton sx={{ display: { xs: 'flex', sm: 'none' } }}>
             <FiSearch />
          </IconButton>
          
          <IconButton>
            <Badge badgeContent={4} color="error">
              <FiBell />
            </Badge>
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 1 }}>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {user || "Administrator"}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Super Admin
              </Typography>
            </Box>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: 'primary.main',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 0 0 2px #fff, 0 0 0 4px ' + theme.palette.primary.light
              }}
            >
              {user ? user.charAt(0).toUpperCase() : <FiUser />}
            </Avatar>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
