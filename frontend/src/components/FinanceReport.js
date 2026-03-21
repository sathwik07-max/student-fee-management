
import React, { useState, useEffect } from "react";
import "./FinanceReport.css";
import { FiDollarSign, FiTrendingUp, FiDownload } from "react-icons/fi";
import { fetchStats, downloadPaymentsExcel } from "../api";

export default function FinanceReport() {
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchStats().then(setStats).catch(console.error);
  }, []);

  const handleDownloadPayments = () => {
    if (!dateRange.start || !dateRange.end) {
      alert("Please select both start and end dates.");
      return;
    }
    downloadPaymentsExcel(dateRange.start, dateRange.end);
  };

  if (!stats) return <div className="loading">Loading report...</div>;

  return (
    <div className="finance-report-container">
      <div className="finance-summary-grid">
        <div className="summary-card total">
          <FiDollarSign className="summary-icon" />
          <div className="summary-details">
            <span className="summary-label">Gross Expected Revenue</span>
            <h2 className="summary-value">₹{stats.total_fees.toLocaleString()}</h2>
          </div>
        </div>
        <div className="summary-card collected">
          <FiTrendingUp className="summary-icon" />
          <div className="summary-details">
            <span className="summary-label">Total Collections</span>
            <h2 className="summary-value">₹{stats.total_paid.toLocaleString()}</h2>
          </div>
        </div>
        <div className="summary-card outstanding">
          <FiDollarSign className="summary-icon" />
          <div className="summary-details">
            <span className="summary-label">Outstanding Arrears</span>
            <h2 className="summary-value">₹{stats.total_due.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      <div className="report-actions-card">
        <h3>Export Transactional Data</h3>
        <p>Generate detailed payment reports for a specific date range.</p>
        <div className="range-picker">
          <div className="input-group">
            <label>Start Date</label>
            <input 
              type="date" 
              value={dateRange.start} 
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>End Date</label>
            <input 
              type="date" 
              value={dateRange.end} 
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
          <button className="download-btn" onClick={handleDownloadPayments}>
            <FiDownload /> Export Payments (Excel)
          </button>
        </div>
      </div>

      <div className="class-breakdown-card">
        <h3>Class-wise Financial Breakdown</h3>
        <table className="breakdown-table">
          <thead>
            <tr>
              <th>Class Name</th>
              <th>Total Fees</th>
              <th>Total Paid</th>
              <th>Total Due</th>
              <th>Collection %</th>
            </tr>
          </thead>
          <tbody>
            {stats.class_stats.map((cls) => (
              <tr key={cls.name}>
                <td>{cls.name}</td>
                <td>₹{cls.total.toLocaleString()}</td>
                <td>₹{cls.paid.toLocaleString()}</td>
                <td>₹{cls.due.toLocaleString()}</td>
                <td>
                  <div className="progress-cell">
                    <span className="percentage">{(cls.paid / cls.total * 100 || 0).toFixed(1)}%</span>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${cls.paid / cls.total * 100}%` }}></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
