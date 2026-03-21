// src/components/AddStudentModal.js
import React, { useState, useEffect } from "react";
import "./AddStudentModal.css";
import { 
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Stack,
  alpha
} from "@mui/material";
import { 
  FiUser, 
  FiCalendar, 
  FiPhone, 
  FiMapPin, 
  FiBookOpen, 
  FiTarget, 
  FiFileText,
  FiPrinter,
  FiSave,
  FiX,
  FiUsers,
  FiTruck,
  FiDollarSign,
  FiCheckCircle
} from "react-icons/fi";
import { fetchBusRoutes, fetchClassroomConfig } from "../api";

const DEFAULT_FORM = {
  admNo: "",
  penNo: "",
  dateOfAdm: "",
  studentName: "",
  gender: "",
  studentAadhar: "",
  fatherName: "",
  fatherAadhar: "",
  motherName: "",
  motherAadhar: "",
  dob: "",
  nationality: "Indian",
  caste: "",
  motherTongue: "Telugu",
  residence: "",
  cellNo: "",
  prevSchool: "",
  particularsTC: "",
  idMark1: "",
  idMark2: "",
  classMedium: "",
  bus_route: "",
  tuitionFee: 0,
  busFee: 0,
  totalPay: 0,
  remarks: "",
};

export default function AddStudentFormPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [busRoutes, setBusRoutes] = useState([]);
  const [classConfig, setClassConfig] = useState([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // Pop-up Control
  const [showFeePopup, setShowFeePopup] = useState(false);

  useEffect(() => {
    fetchBusRoutes().then(setBusRoutes).catch(console.error);
    fetchClassroomConfig().then(setClassConfig).catch(console.error);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => {
        const updated = { ...f, [name]: value };
        
        // Background calculations for the pop-up
        if (name === "classMedium") {
            const config = classConfig.find(c => c.name === value);
            if (config) updated.tuitionFee = config.fee;
        }
        if (name === "bus_route") {
            const route = busRoutes.find(r => r.location === value);
            if (route) updated.busFee = route.yearly;
            else updated.busFee = 0;
        }
        return updated;
    });
  }

  // Phase 1: Open Pop-up instead of saving
  function handlePreSave(e) {
    e.preventDefault();
    setShowFeePopup(true);
  }

  // Phase 2: Final Backend Save
  async function handleFinalSubmit() {
    setSaving(true);
    setError("");
    setShowFeePopup(false);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/admissions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      setSaving(false);
      
      if (res.ok && data.success) {
        setSuccess(true);
        if (window.opener) window.opener.postMessage("admissionSaved", "*");
        setTimeout(() => { window.print(); }, 800);
      } else {
        setError(data.error || "Failed to save admission.");
      }
    } catch (err) {
      setSaving(false);
      setError("Network error. Please ensure the server is running.");
    }
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="cute-admission-container">
      <div className="admission-page-a4">
        <div className="watermark-bg">
           <img src="/logo.png" alt="School Watermark" />
        </div>

        <div className="a4-content-wrapper">
          <div className="admission-header-premium">
            <div className="header-decoration left"></div>
            <div className="header-decoration right"></div>
            <div className="header-content">
              <img src="/logo.png" alt="School Logo" className="header-school-logo" />
              <div className="school-details">
                <h1 className="school-title">ADARSHA HIGH SCHOOL</h1>
                <p className="school-location">Kamalapuram, Mangapet(M), Mulug Dist. 506172</p>
                <div className="admission-badge">ADMISSION FORM</div>
              </div>
            </div>
          </div>

          <form onSubmit={handlePreSave} className="admission-form-grid">
            <div className="form-card highlight-card">
              <div className="grid-row">
                <div className="input-box">
                  <label><FiTarget /> Adm. No</label>
                  <input name="admNo" value={form.admNo} onChange={handleChange} required />
                </div>
                <div className="input-box">
                  <label><FiFileText /> PEN No</label>
                  <input name="penNo" value={form.penNo} onChange={handleChange} />
                </div>
                <div className="input-box">
                  <label><FiCalendar /> Date of Adm</label>
                  <input type="date" name="dateOfAdm" value={form.dateOfAdm} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="section-divider">
              <span><FiUser /> Student Particulars</span>
            </div>

            <div className="form-card">
              <div className="grid-row">
                <div className="input-box span-3">
                  <label>1. Full Name of the Student (As per Aadhar)</label>
                  <input name="studentName" value={form.studentName} onChange={handleChange} required className="name-input" placeholder="Enter Full Name" />
                </div>
              </div>
              <div className="grid-row">
                <div className="input-box">
                  <label>Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="input-box">
                  <label>Student Aadhar No</label>
                  <input name="studentAadhar" value={form.studentAadhar} onChange={handleChange} />
                </div>
                <div className="input-box">
                  <label>Date of Birth</label>
                  <input type="date" name="dob" value={form.dob} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="section-divider">
              <span><FiUsers /> Family Information</span>
            </div>

            <div className="form-card">
              <div className="grid-row">
                <div className="input-box span-2">
                  <label>4. Father Name</label>
                  <input name="fatherName" value={form.fatherName} onChange={handleChange} required />
                </div>
                <div className="input-box">
                  <label>Father Aadhar</label>
                  <input name="fatherAadhar" value={form.fatherAadhar} onChange={handleChange} />
                </div>
              </div>
              <div className="grid-row">
                <div className="input-box span-2">
                  <label>5. Mother Name</label>
                  <input name="motherName" value={form.motherName} onChange={handleChange} />
                </div>
                <div className="input-box">
                  <label>Mother Aadhar</label>
                  <input name="motherAadhar" value={form.motherAadhar} onChange={handleChange} />
                </div>
              </div>
              <div className="grid-row">
                <div className="input-box">
                  <label>Caste</label>
                  <input name="caste" value={form.caste} onChange={handleChange} />
                </div>
                <div className="input-box">
                  <label>Mother Tongue</label>
                  <input name="motherTongue" value={form.motherTongue} onChange={handleChange} />
                </div>
                <div className="input-box">
                  <label><FiPhone /> Cell No</label>
                  <input name="cellNo" value={form.cellNo} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="section-divider">
              <span><FiMapPin /> Contact & Identification</span>
            </div>

            <div className="form-card">
              <div className="grid-row compact">
                <div className="input-box span-3">
                  <label>9. Residential Address</label>
                  <input name="residence" value={form.residence} onChange={handleChange} />
                </div>
              </div>
              <div className="grid-row compact">
                <div className="input-box span-3">
                  <label>11. Previous School Studied</label>
                  <input name="prevSchool" value={form.prevSchool} onChange={handleChange} />
                </div>
              </div>
              <div className="grid-row compact">
                <div className="input-box span-3">
                  <label>13. Identification Marks (Moles/Scars)</label>
                  <div className="mole-inputs">
                     <div className="mole-row"><span className="dot"></span><input name="idMark1" value={form.idMark1} onChange={handleChange} placeholder="First visible identification mark" /></div>
                     <div className="mole-row"><span className="dot"></span><input name="idMark2" value={form.idMark2} onChange={handleChange} placeholder="Second visible identification mark" /></div>
                  </div>
                </div>
              </div>
              <div className="grid-row">
                <div className="input-box">
                  <label><FiBookOpen /> Class & Medium</label>
                  <select name="classMedium" value={form.classMedium} onChange={handleChange} required>
                    <option value="">Select Class</option>
                    {["Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="input-box">
                  <label><FiTruck /> Bus Route / Location</label>
                  <select name="bus_route" value={form.bus_route} onChange={handleChange}>
                    <option value="">No Transport</option>
                    {busRoutes.map(r => (
                      <option key={r.id} value={r.location}>{r.location}</option>
                    ))}
                  </select>
                </div>
                <div className="input-box">
                  <label>Remarks</label>
                  <input name="remarks" value={form.remarks} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="signature-grid">
              <div className="sig-column"><div className="sig-space"></div><p>Student Signature</p></div>
              <div className="sig-column"><div className="sig-space"></div><p>Parent/Guardian</p></div>
              <div className="sig-column"><div className="sig-space"></div><p>Principal Signature</p></div>
            </div>

            <div className="web-actions no-print">
              {error && <div className="toast-error">{error}</div>}
              {success && (
                <div className="success-banner">
                  <Typography variant="h6">🎉 Admission Saved Successfully!</Typography>
                  <Button variant="contained" color="success" startIcon={<FiPrinter />} onClick={() => import("../api").then(api => api.downloadFeeCard(form.admNo))} sx={{ mt: 1 }}>Download Fee Card</Button>
                </div>
              )}
              <div className="action-buttons-flex">
                <button type="button" className="btn-secondary" onClick={() => window.close()}><FiX /> Close</button>
                <button type="button" className="btn-accent" onClick={handlePrint}><FiPrinter /> Preview</button>
                <button type="submit" className="btn-primary" disabled={saving}><FiSave /> {saving ? "Saving..." : "Save & Print"}</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* FEE CONFIRMATION POP-UP */}
      <Dialog 
        open={showFeePopup} 
        onClose={() => setShowFeePopup(false)}
        PaperProps={{ sx: { borderRadius: 4, padding: 1, minWidth: 450 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, color: 'primary.main' }}>
          <FiDollarSign /> Verify Fee & Initial Payment
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Review the annual fees for <b>{form.studentName}</b> ({form.classMedium}). These are auto-filled from master settings.
          </Typography>
          
          <Stack spacing={3}>
            <TextField
              label="Annual Tuition Fee (₹)"
              type="number"
              fullWidth
              name="tuitionFee"
              value={form.tuitionFee}
              onChange={handleChange}
              variant="outlined"
            />
            <TextField
              label="Annual Bus Fee (₹)"
              type="number"
              fullWidth
              name="busFee"
              value={form.busFee}
              onChange={handleChange}
              disabled={!form.bus_route}
              helperText={!form.bus_route ? "No bus route selected" : ""}
            />
            <Divider>
               <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>PAYMENT RECORD</Typography>
            </Divider>
            <TextField
              label="Initial Payment (Today's Receipt)"
              placeholder="Enter amount paid today"
              type="number"
              fullWidth
              name="totalPay"
              value={form.totalPay}
              onChange={handleChange}
              color="success"
              focused
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowFeePopup(false)} color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button 
            onClick={handleFinalSubmit} 
            variant="contained" 
            startIcon={<FiCheckCircle />}
            sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
          >
            Confirm & Save Admission
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
