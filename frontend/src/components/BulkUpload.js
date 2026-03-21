
import React, { useState } from "react";
import "./BulkUpload.css";
import { FiUpload, FiLock, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { uploadStudents, verifyPassword } from "../api";

export default function BulkUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(null);
    setError(null);
  };

  const handleUploadClick = () => {
    if (!file) {
      setError("Please select an Excel file first.");
      return;
    }
    setShowPasswordInput(true);
  };

  const handleFinalUpload = async () => {
    setUploading(true);
    setError(null);

    try {
      const isValid = await verifyPassword(password);
      if (!isValid) {
        setError("Incorrect administrator password.");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const data = await uploadStudents(formData);

      if (data.success) {
        setMessage(data.message);
        setFile(null);
        setPassword("");
        setShowPasswordInput(false);
        if (onUploadSuccess) onUploadSuccess();
      } else {
        setError(data.error || "Upload failed.");
      }
    } catch (err) {
      setError("Server connection error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bulk-upload-card">
      <div className="backup-info">
        <h3>Bulk Student Upload</h3>
        <p>Upload student details and fee structures via Excel (.xlsx) file.</p>
        <div className="template-link">
            <small>Ensure columns match: ID.NO, NAME, F.NAME, CLASS, VILLAGE, PH.NO, old due, sc.fee, comp, ex.fee, bus fee, bus route, Hosteler/Dayscholar</small>
        </div>
      </div>

      <div className="upload-controls">
        <div className="file-input-wrapper">
           <input 
             type="file" 
             accept=".xlsx" 
             onChange={handleFileChange} 
             id="bulk-file-input"
           />
           <label htmlFor="bulk-file-input" className="file-label">
              {file ? file.name : "Choose Excel File"}
           </label>
        </div>

        {!showPasswordInput ? (
          <button 
            className="upload-btn-trigger" 
            onClick={handleUploadClick}
            disabled={!file || uploading}
          >
            <FiUpload /> Start Upload
          </button>
        ) : (
          <div className="password-upload-group">
            <div className="password-input-wrapper">
              <FiLock className="lock-icon" />
              <input 
                type="password" 
                placeholder="Admin Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            <button 
              className="upload-btn-confirm" 
              onClick={handleFinalUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Confirm & Upload"}
            </button>
            <button 
              className="upload-btn-cancel" 
              onClick={() => setShowPasswordInput(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="upload-message success">
          <FiCheckCircle /> {message}
        </div>
      )}
      {error && (
        <div className="upload-message error">
          <FiAlertCircle /> {error}
        </div>
      )}
    </div>
  );
}
