import React, { useState } from "react";
import "./PasswordModal.css";

export default function PasswordModal({ onConfirm, onClose }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(password);
  };

  return (
    <div className="password-modal-overlay">
      <div className="password-modal-card">
        <div className="security-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h3>Security Verification</h3>
        <p>Please enter the administrator password to edit student records.</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            autoFocus
            className={error ? "error-input" : ""}
            required
          />
          {error && <div className="error-text">❌ Incorrect Password</div>}
          
          <div className="password-modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-verify">
              Unlock Access
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
