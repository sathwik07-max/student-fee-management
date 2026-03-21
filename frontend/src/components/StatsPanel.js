
import React, { useState, useEffect } from "react";
import "./StatsPanel.css";
import { FiUsers, FiDollarSign, FiCreditCard, FiAlertCircle } from "react-icons/fi";
import { fetchStats } from "../api";

export default function StatsPanel({ students }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const getStats = async () => {
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    getStats();
  }, [students]);

  if (!stats) return <div className="stats-loading">Loading stats...</div>;

  const statsData = [
    {
      id: 1,
      label: "Total Students",
      value: stats.total_students.toLocaleString(),
      icon: <FiUsers />,
      color: "#3b82f6",
      sub: "Active Enrolled",
    },
    {
      id: 2,
      label: "Fees Expected",
      value: `₹${stats.total_fees.toLocaleString()}`,
      icon: <FiDollarSign />,
      color: "#8b5cf6",
      sub: "Academic Year 2025-26",
    },
    {
      id: 3,
      label: "Total Collected",
      value: `₹${stats.total_paid.toLocaleString()}`,
      icon: <FiCreditCard />,
      color: "#10b981",
      sub: `${((stats.total_paid/stats.total_fees) * 100 || 0).toFixed(1)}% Collection Rate`,
    },
    {
      id: 4,
      label: "Outstanding Due",
      value: `₹${stats.total_due.toLocaleString()}`,
      icon: <FiAlertCircle />,
      color: "#f59e0b",
      sub: "Needs Recovery",
    },
  ];

  return (
    <div className="stats-grid">
      {statsData.map((stat) => (
        <div key={stat.id} className="stat-card">
          <div className="stat-card-header">
             <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
             </div>
          </div>
          <div className="stat-card-body">
             <p className="stat-label">{stat.label}</p>
             <h2 className="stat-value">{stat.value}</h2>
             <p className="stat-sub">{stat.sub}</p>
          </div>
          <div className="stat-progress-bg">
             <div 
               className="stat-progress-bar" 
               style={{ 
                 width: stat.id === 3 ? `${(stats.total_paid/stats.total_fees) * 100}%` : '100%', 
                 backgroundColor: stat.color 
               }} 
             />
          </div>
        </div>
      ))}
    </div>
  );
}
