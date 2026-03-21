import React, { useState } from "react";
import "./StudentEditModal.css";
import { editStudent, downloadFeeCard, verifyPassword } from "../api";
import { 
  FiUser, FiBook, FiMapPin, FiPhone, FiDollarSign, 
  FiClock, FiPrinter, FiSave, FiX, FiLock, FiUnlock, FiPlusCircle 
} from "react-icons/fi";

const FEE_FIELDS = ["old due", "sc.fee", "comp", "ex.fee", "bus fee"];

export default function StudentEditModal({ student, onClose, onSave }) {
  const [form, setForm] = useState({ ...student });
  const [saving, setSaving] = useState(false);
  const [feeEditMode, setFeeEditMode] = useState(false);
  const [newPayment, setNewPayment] = useState("");
  
  const [feePwd, setFeePwd] = useState("");
  const [showPwdPrompt, setShowPwdPrompt] = useState(false);
  const [pwdError, setPwdError] = useState("");

  // Calculations - Priority to backend provided totals
  const oldDue = Number(form["old due"] || 0);
  const scFee = Number(form["sc.fee"] || 0);
  const comp = Number(form["comp"] || 0);
  const exFee = Number(form["ex.fee"] || 0);
  const busFee = Number(form["bus fee"] || 0);
  
  // Use the backend provided totals if available, otherwise fallback to local calc
  const totalPayable = form.total || (oldDue + scFee + comp + exFee + busFee);
  const totalPaid = form["total pay"] !== undefined ? form["total pay"] : (form.payments ? form.payments.reduce((acc, p) => acc + p.amount, 0) : 0);
  const balanceDue = form["final due"] !== undefined ? form["final due"] : Math.max(0, totalPayable - totalPaid);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    try {
        const isValid = await verifyPassword(feePwd);
        if (isValid) {
          setFeeEditMode(true);
          setShowPwdPrompt(false);
          setPwdError("");
          setFeePwd("");
        } else {
          setPwdError("Incorrect password!");
        }
    } catch (err) {
        setPwdError("Verification failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Calculate totalPayable for the payload
    const payload = {
      ...form,
      "total": totalPayable,
      "total pay": totalPaid,
      "final due": balanceDue,
      new_payment: newPayment 
    };

    try {
      const res = await editStudent(payload);
      if (res.success) {
        // IMPORTANT: Update state with data from server to see new transactions
        setForm(res.student);
        setNewPayment("");
        setFeeEditMode(false);
        onSave(res.student); // Update dashboard list too
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    downloadFeeCard(form["ID.NO"]);
  };

  return (
    <div className="royal-modal-overlay">
      <div className="royal-modal-card modern-erp-modal">
        <div className="modal-header-flex">
          <div>
            <h2 className="modal-title-main">Student Master Record</h2>
            <p className="modal-subtitle">ID: {form["ID.NO"]} | Session: 2024-25</p>
          </div>
          <button className="close-x" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit} className="erp-form-layout">
          <div className="erp-grid-container">
            
            {/* LEFT COLUMN: Student Profile */}
            <div className="erp-column">
              <div className="erp-section-box">
                <h3 className="section-label"><FiUser /> PERSONAL PROFILE</h3>
                <div className="input-stack">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input name="NAME" value={form["NAME"] || ""} onChange={handleChange} required />
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Class</label>
                      <input name="CLASS" value={form["CLASS"] || ""} onChange={handleChange} />
                    </div>
                    <div className="input-group">
                      <label>Section</label>
                      <input name="SECTION" value={form["SECTION"] || ""} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Parent Name</label>
                    <input name="F.NAME" value={form["F.NAME"] || ""} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input name="PH.NO" value={form["PH.NO"] || ""} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Village/Location</label>
                    <input name="VILLAGE" value={form["VILLAGE"] || ""} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="erp-section-box payment-entry-box">
                <h3 className="section-label"><FiPlusCircle /> QUICK PAYMENT RECEIPT</h3>
                <div className="payment-input-wrapper">
                  <span className="currency-prefix">₹</span>
                  <input 
                    type="number" 
                    placeholder="Enter amount to pay..." 
                    value={newPayment}
                    onChange={(e) => setNewPayment(e.target.value)}
                    className="big-payment-input"
                  />
                </div>
                <p className="payment-hint">This will generate a new transaction record upon saving.</p>
              </div>
            </div>

            {/* RIGHT COLUMN: Fee Statement & Transactions */}
            <div className="erp-column">
              <div className="erp-section-box fee-statement-box">
                <div className="section-header-flex">
                  <h3 className="section-label"><FiDollarSign /> FEE STATEMENT</h3>
                  {!feeEditMode ? (
                    <button type="button" className="unlock-btn" onClick={() => setShowPwdPrompt(true)}>
                      <FiLock /> Unlock
                    </button>
                  ) : (
                    <span className="unlocked-tag"><FiUnlock /> Editing Enabled</span>
                  )}
                </div>

                <div className="fee-rows-stack">
                  <div className="fee-item-row">
                    <span>Opening Balance (Old Due)</span>
                    <input name="old due" value={form["old due"] || 0} onChange={handleChange} readOnly={!feeEditMode} />
                  </div>
                  <div className="fee-item-row">
                    <span>School Tuition Fee</span>
                    <input name="sc.fee" value={form["sc.fee"] || 0} onChange={handleChange} readOnly={!feeEditMode} />
                  </div>
                  <div className="fee-item-row">
                    <span>Computer & Lab Fee</span>
                    <input name="comp" value={form["comp"] || 0} onChange={handleChange} readOnly={!feeEditMode} />
                  </div>
                  <div className="fee-item-row">
                    <span>Examination Fee</span>
                    <input name="ex.fee" value={form["ex.fee"] || 0} onChange={handleChange} readOnly={!feeEditMode} />
                  </div>
                  <div className="fee-item-row">
                    <span>Bus/Transport Fee</span>
                    <input name="bus fee" value={form["bus fee"] || 0} onChange={handleChange} readOnly={!feeEditMode} />
                  </div>
                  
                  <div className="fee-summary-divider"></div>
                  
                  <div className="summary-row total">
                    <span>Total Payable</span>
                    <span>₹{totalPayable.toLocaleString()}</span>
                  </div>
                  <div className="summary-row paid">
                    <span>Total Received (-)</span>
                    <span>₹{totalPaid.toLocaleString()}</span>
                  </div>
                  <div className={`summary-row balance ${balanceDue > 0 ? 'due' : 'cleared'}`}>
                    <span>Net Balance Due</span>
                    <span>₹{balanceDue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="erp-section-box">
                <h3 className="section-label"><FiClock /> RECENT TRANSACTIONS</h3>
                <div className="mini-table-wrapper">
                  <table className="mini-transactions">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Ref</th>
                        <th align="right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.payments && form.payments.length > 0 ? (
                        form.payments.slice().reverse().map((p) => (
                          <tr key={p.id}>
                            <td>{p.payment_date || "N/A"}</td>
                            <td><span className="ref-badge">REC-{p.id}</span></td>
                            <td align="right" className="amount-text">₹{p.amount.toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="3" align="center" className="empty-text">No payments yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="erp-modal-footer">
            <button type="button" className="btn-print-large" onClick={handlePrint}>
              <FiPrinter /> Download Fee Card (PDF)
            </button>
            <div className="footer-actions-right">
              <button type="button" className="btn-cancel-text" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-save-erp" disabled={saving}>
                <FiSave /> {saving ? "Processing..." : "Save Record"}
              </button>
            </div>
          </div>
        </form>

        {/* Password Dialog */}
        {showPwdPrompt && (
          <div className="pwd-overlay">
            <div className="pwd-card">
              <h3 className="pwd-title">Security Verification</h3>
              <p>Enter administrative password to modify fee structures.</p>
              <form onSubmit={handlePwdSubmit}>
                <input
                  type="password"
                  value={feePwd}
                  onChange={(e) => setFeePwd(e.target.value)}
                  placeholder="Enter Password"
                  autoFocus
                />
                {pwdError && <div className="pwd-error">{pwdError}</div>}
                <div className="pwd-actions">
                  <button type="button" onClick={() => setShowPwdPrompt(false)}>Cancel</button>
                  <button type="submit" className="unlock-confirm">Confirm Unlock</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
