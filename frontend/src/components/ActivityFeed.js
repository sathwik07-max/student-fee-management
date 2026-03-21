
import React, { useState, useEffect } from "react";
import "./ActivityFeed.css";
import { FiActivity, FiUser, FiClock, FiCheck } from "react-icons/fi";
import { fetchAuditLogs } from "../api";

export default function ActivityFeed() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const interval = setInterval(getLogs, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="feed-loading">Updating feed...</div>;

  return (
    <div className="activity-feed-container">
      <div className="feed-header">
        <FiActivity className="header-icon" />
        <h3>System Activity Feed</h3>
      </div>
      
      <div className="feed-list">
        {logs.length === 0 ? (
          <p className="empty-feed">No recent activity detected.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="feed-item">
              <div className="feed-item-icon">
                {log.action.includes("Payment") ? <FiCheck style={{color: "#10b981"}} /> : <FiUser style={{color: "#3b82f6"}} />}
              </div>
              <div className="feed-item-content">
                <div className="feed-item-top">
                  <span className="feed-action">{log.action}</span>
                  <span className="feed-time">
                    <FiClock /> {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="feed-details">
                  {log.target_type === "student" && <strong>ID: {log.target_id}</strong>}
                  {log.details && ` - ${typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}`}
                </p>
                <span className="feed-user">by {log.user?.username || "System"}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
