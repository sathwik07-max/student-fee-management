import React, { useState, useEffect } from "react";
import "./ActivityFeed.css";
import { 
  FiActivity, 
  FiUser, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiPlusCircle, 
  FiTrash2,
  FiRepeat,
  FiDatabase
} from "react-icons/fi";
import { fetchAuditLogs } from "../api";
import { Box, Typography, Avatar, alpha, useTheme } from "@mui/material";

export default function ActivityFeed() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const getLogs = async () => {
    try {
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLogs();
    const interval = setInterval(getLogs, 30000); 
    return () => clearInterval(interval);
  }, []);

  const getActionIcon = (action) => {
    if (action.includes("Payment") || action.includes("Paid")) return <FiCheckCircle style={{color: theme.palette.success.main}} />;
    if (action.includes("Delete")) return <FiTrash2 style={{color: theme.palette.error.main}} />;
    if (action.includes("Add") || action.includes("Create")) return <FiPlusCircle style={{color: theme.palette.secondary.main}} />;
    if (action.includes("Update") || action.includes("Edit")) return <FiRepeat style={{color: theme.palette.info.main}} />;
    if (action.includes("Rollover") || action.includes("Reset")) return <FiDatabase style={{color: theme.palette.warning.main}} />;
    return <FiActivity style={{color: theme.palette.primary.main}} />;
  };

  const getActionColor = (action) => {
    if (action.includes("Payment") || action.includes("Paid")) return theme.palette.success.main;
    if (action.includes("Delete")) return theme.palette.error.main;
    if (action.includes("Add") || action.includes("Create")) return theme.palette.secondary.main;
    if (action.includes("Update") || action.includes("Edit")) return theme.palette.info.main;
    if (action.includes("Rollover") || action.includes("Reset")) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  if (loading) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Syncing activity...
      </Typography>
    </Box>
  );

  return (
    <div className="activity-feed-container">
      <div className="feed-header">
        <Box sx={{ 
          p: 1, 
          borderRadius: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.05), 
          color: 'primary.main',
          display: 'flex',
          mr: 1.5
        }}>
          <FiActivity size={20} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.1rem' }}>
          Recent Activity
        </Typography>
      </div>
      
      <div className="feed-list">
        {logs.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <FiDatabase size={40} style={{ color: alpha(theme.palette.text.disabled, 0.3), marginBottom: '1rem' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              No recent logs found.
            </Typography>
          </Box>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="feed-item">
              <div 
                className="feed-item-icon" 
                style={{ backgroundColor: alpha(getActionColor(log.action), 0.1) }}
              >
                {getActionIcon(log.action)}
              </div>
              <div className="feed-item-content">
                <div className="feed-item-top">
                  <span className="feed-action">{log.action}</span>
                  <span className="feed-time">
                    <FiClock size={12} /> {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="feed-details">
                  {log.target_type === "student" && <span className="feed-id-tag">ID: {log.target_id}</span>}
                  {log.details && ` ${typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}`}
                </p>
                <div className="feed-footer">
                   <span className="feed-user-tag">Admin: <strong>{log.user?.username || "System"}</strong></span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
