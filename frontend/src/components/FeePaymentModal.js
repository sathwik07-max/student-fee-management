import React, { useState } from "react";
import { editStudent } from "../api";
import "./FeePaymentModal.css";

export default function FeePaymentModal({
  student,
  onClose,
  onPaid,
  onNotify,
}) {
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!student) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return setError("Enter a valid amount!");

    setSaving(true);
    try {
      // We send the student's ID and the NEW payment amount
      // The backend will create a new Payment record automatically
      const paymentData = {
        "ID.NO": student["ID.NO"],
        "new_payment": Number(amount)
      };

      await editStudent(paymentData);
      
      setSaving(false);
      if (onNotify) onNotify(`₹${amount} payment recorded!`);
      if (onPaid) onPaid();
      onClose();
    } catch (err) {
      setSaving(false);
      setError("Failed to submit payment. Please check your connection.");
    }
  };

  return (
    <div className="fee-modal-overlay">
      <div className="fee-modal-card">
        <h2>Record Fee Payment</h2>
        <div className="student-summary">
          <p>
            <b>{student.NAME}</b> (ID: {student["ID.NO"]})
          </p>
          <div className="due-badge">
            Class: {student.CLASS} | Pending Due: <b>₹{student["final due"]}</b>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="fee-modal-row">
            <label>
              Amount to Pay (₹):
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={1}
                placeholder="Enter amount"
                required
                autoFocus
                disabled={saving}
              />
            </label>
          </div>
          
          {error && <div className="fee-modal-error">{error}</div>}
          
          <div className="fee-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="modal-cancel"
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="modal-save" disabled={saving}>
              {saving ? "Processing..." : "Submit Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
