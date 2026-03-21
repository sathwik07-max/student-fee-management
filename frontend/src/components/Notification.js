// src/components/Notification.js
import React, { useEffect } from "react";
import "./Notification.css";

// Simple notification/toast that auto-closes after 3 seconds
export default function Notification({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="notification-toast">
      {message}
      <button className="notification-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}
