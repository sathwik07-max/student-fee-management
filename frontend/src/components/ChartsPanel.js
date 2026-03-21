import React, { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import "./ChartsPanel.css";
import { fetchStats } from "../api";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

export default function ChartsPanel({ students }) {
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

  if (!stats) return <div className="charts-loading">Loading charts...</div>;

  const pieData = [
    { name: "Collected", value: stats.total_paid },
    { name: "Outstanding", value: stats.total_due }
  ];

  const barData = [...stats.class_stats].sort((a, b) => 
    String(a.name).localeCompare(String(b.name), undefined, {numeric: true})
  );

  return (
    <div className="charts-panel">
      <div className="chart-card">
        <div className="chart-header">
           <h4>Overall Collection Status</h4>
           <p>Total Revenue vs Collected</p>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={5}
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              <Cell fill="#10b981" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value) => `₹${value.toLocaleString()}`}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart-card">
        <div className="chart-header">
           <h4>Class-wise Distribution</h4>
           <p>Revenue & Dues per Class</p>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `₹${value/1000}k`}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value) => `₹${value.toLocaleString()}`}
            />
            <Legend verticalAlign="bottom" height={36}/>
            <Bar dataKey="paid" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Paid" barSize={30} />
            <Bar dataKey="due" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} name="Due" barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
