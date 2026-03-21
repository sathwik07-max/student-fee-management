// src/components/BackupButton.js
import React from "react";
import { backupDatabase } from "../api";

export default function BackupButton() {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <button onClick={backupDatabase}>Backup Database</button>
    </div>
  );
}
