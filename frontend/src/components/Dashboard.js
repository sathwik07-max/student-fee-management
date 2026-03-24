// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Pagination,
  Stack,
  useTheme,
  useMediaQuery,
  IconButton,
  Chip,
  alpha
} from "@mui/material";
import { 
  FiRefreshCw, 
  FiDatabase, 
  FiPlus, 
  FiDownload,
  FiFileText,
  FiUploadCloud,
  FiTrendingUp
} from "react-icons/fi";

// Import API and existing components
import {
  fetchStudents,
  fetchAlumni,
  deleteStudent as apiDeleteStudent,
  verifyPassword,
  academicYearRollover,
  nuclearReset
} from "../api";
import { GiNuclearBomb } from "react-icons/gi";
import StatsPanel from "./StatsPanel";
import StudentEditModal from "./StudentEditModal";
import FeePaymentModal from "./FeePaymentModal";
import Notification from "./Notification";
import ChartsPanel from "./ChartsPanel";
import FilterBar from "./FilterBar";
import StudentTable from "./StudentTable";
import DownloadButtons from "./DownloadButtons";
import BackupButton from "./BackupButton";
import DownloadPaymentsButton from "./DownloadPaymentsButton";
import PasswordModal from "./PasswordModal";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BulkUpload from "./BulkUpload";
import AdmissionsList from "./AdmissionsList";
import ActivityFeed from "./ActivityFeed";
import FinanceReport from "./FinanceReport";
import FeeSettings from "./FeeSettings";
import TeacherManagement from "./TeacherManagement";
import BulkPromotion from "./BulkPromotion";

export default function Dashboard({ onLogout }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchId, setSearchId] = useState("");
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [villages, setVillages] = useState(["All"]);
  const [classes, setClasses] = useState(["All"]);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedVillage, setSelectedVillage] = useState("All");
  const [selectedBus, setSelectedBus] = useState("All");
  const [dueMin, setDueMin] = useState("");
  const [dueMax, setDueMax] = useState("");
  const [hostel, setHostel] = useState("All");
  const [showEdit, setShowEdit] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [notification, setNotification] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStudent, setPaymentStudent] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const username = localStorage.getItem("username");
  const userRole = localStorage.getItem("role");
  const canCollectFees = localStorage.getItem("can_collect_fees") === "true";
  const isAdmin = userRole === 'admin' || username === 'admin';

  const refreshStudents = () => {
    const fetchFunc = activeTab === 'alumni' ? fetchAlumni : fetchStudents;
    
    fetchFunc().then((data) => {
      setStudents(data);
      setFiltered(data);
      
      const vset = new Set();
      data.forEach((s) => {
        if (s.VILLAGE && String(s.VILLAGE).trim() !== "") {
          vset.add(String(s.VILLAGE).trim());
        }
      });
      setVillages(["All", ...Array.from(vset)]);
      
      const cset = new Set();
      data.forEach((s) => {
        if (s.CLASS && String(s.CLASS).trim() !== "") {
          cset.add(String(s.CLASS).trim());
        }
      });
      setClasses(["All", ...Array.from(cset)]);
    }).catch(err => {
      console.error("Refresh Error:", err);
      setNotification("Failed to connect to server. Ensure backend is running.");
    });
  };

  useEffect(() => {
    refreshStudents();
  }, [activeTab]);

  useEffect(() => {
    const handleMsg = (e) => {
      if (e.data === "admissionSaved") refreshStudents();
    };
    window.addEventListener("message", handleMsg);
    return () => window.removeEventListener("message", handleMsg);
  }, []);

  useEffect(() => {
    let data = [...students];
    if (searchId) {
      data = data.filter(s => String(s["ID.NO"] || "").trim().toLowerCase() === searchId.trim().toLowerCase());
    }
    if (search) {
      const searchLower = search.trim().toLowerCase();
      data = data.filter(s => 
        (s.NAME && s.NAME.toLowerCase().includes(searchLower)) ||
        (s["F.NAME"] && s["F.NAME"].toLowerCase().includes(searchLower))
      );
    }
    if (selectedClass !== "All") data = data.filter(s => String(s.CLASS).trim() === selectedClass);
    if (selectedVillage !== "All") data = data.filter(s => String(s.VILLAGE).trim() === selectedVillage);
    if (selectedBus !== "All") data = data.filter(s => s["bus route"] === selectedBus);
    if (hostel !== "All") data = data.filter(s => s["Hosteler/Dayscholar"] === hostel);
    if (dueMin) data = data.filter(s => parseInt(s["final due"] || "0") >= parseInt(dueMin));
    if (dueMax) data = data.filter(s => parseInt(s["final due"] || "0") <= parseInt(dueMax));
    
    setFiltered(data);
    setPage(1);
  }, [search, searchId, selectedClass, selectedVillage, selectedBus, dueMin, dueMax, hostel, students]);

  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleEditRequest = (student) => {
    setSelectedStudent(student);
    setShowEdit(true);
  };

  const handleDeleteRequest = (id) => {
    setPendingAction({ type: 'delete', data: id });
    setShowPasswordModal(true);
  };

  const handleRolloverRequest = () => {
    if (window.confirm("CRITICAL: Academic Year Rollover will reset all current fees and carry over dues. Proceed?")) {
       setPendingAction({ type: 'rollover' });
       setShowPasswordModal(true);
    }
  };

  const handleNuclearRequest = () => {
    if (window.confirm("FATAL WARNING: This will permanently DELETE all students, payments, and fees. This action is IRREVERSIBLE. Are you absolutely sure?")) {
        setPendingAction({ type: 'nuclear_reset' });
        setShowPasswordModal(true);
    }
  };

  const handlePasswordSuccess = async (password) => {
    try {
        const isValid = await verifyPassword(password);
        if (!isValid) { alert("Incorrect Password!"); return; }
        setShowPasswordModal(false);
        if (pendingAction.type === 'edit') { setSelectedStudent(pendingAction.data); setShowEdit(true); }
        else if (pendingAction.type === 'delete') {
            await apiDeleteStudent(pendingAction.data);
            refreshStudents();
            setNotification("Student record deleted.");
        } else if (pendingAction.type === 'rollover') {
            const nextYear = window.prompt("Enter the name for the new Academic Year (e.g., 2025-26):");
            if (!nextYear) return;
            await academicYearRollover(nextYear);
            setNotification("Academic Year Rollover Complete!");
            refreshStudents();
        } else if (pendingAction.type === 'nuclear_reset') {
            await nuclearReset(password);
            setNotification("SYSTEM WIPED SUCCESSFULLY.");
            refreshStudents();
            setActiveTab("overview");
        }
        setPendingAction(null);
    } catch (e) { alert("Error: " + e.message); }
  };

  const handleOpenAdd = () => {
    const win = window.open(window.location.origin + "/add-student", "_blank", "width=860,height=1150");
    const listener = (e) => {
      if (e.data === "admissionSaved") {
        refreshStudents();
        win.close();
        window.removeEventListener("message", listener);
        setNotification("Student added successfully!");
      }
    };
    window.addEventListener("message", listener);
  };

  const PageHeader = ({ title, subtitle, actions }) => (
    <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>{title}</Typography>
        <Typography variant="body1" color="text.secondary">{subtitle}</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>{actions}</Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout}
        onAddStudent={handleOpenAdd}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      
      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - 280px)` } }}>
        <TopBar user={username} onSearch={setSearch} onMenuToggle={() => setMobileOpen(true)} />
        
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, md: 4 } }}>
          {activeTab === "overview" && (
            <>
              <PageHeader 
                title="Overview Dashboard" 
                subtitle={`Welcome back, ${username || 'Admin'}. Here is an overview of the school status.`}
                actions={<Chip label="Live Data" color="success" variant="outlined" sx={{ fontWeight: 700 }} />}
              />
              
              {/* Quick Actions Row */}
              {isAdmin && (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper 
                      elevation={0}
                      onClick={handleOpenAdd}
                      sx={{ 
                        p: 2, borderRadius: 3, textAlign: 'center', cursor: 'pointer',
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1), transform: 'translateY(-4px)' },
                        transition: 'all 0.2s'
                      }}
                    >
                      <Box sx={{ color: 'primary.main', fontSize: '2rem', mb: 1 }}><FiPlus /></Box>
                      <Typography variant="subtitle2" fontWeight={700}>New Admission</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper 
                      elevation={0}
                      onClick={() => setActiveTab("admissions")}
                      sx={{ 
                        p: 2, borderRadius: 3, textAlign: 'center', cursor: 'pointer',
                        bgcolor: alpha(theme.palette.info.main, 0.05),
                        border: '1px solid', borderColor: alpha(theme.palette.info.main, 0.1),
                        '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1), transform: 'translateY(-4px)' },
                        transition: 'all 0.2s'
                      }}
                    >
                      <Box sx={{ color: 'info.main', fontSize: '2rem', mb: 1 }}><FiFileText /></Box>
                      <Typography variant="subtitle2" fontWeight={700}>Admission Records</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper 
                      elevation={0}
                      onClick={() => setActiveTab("promotion")}
                      sx={{ 
                        p: 2, borderRadius: 3, textAlign: 'center', cursor: 'pointer',
                        bgcolor: alpha(theme.palette.secondary.main, 0.05),
                        border: '1px solid', borderColor: alpha(theme.palette.secondary.main, 0.1),
                        '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.1), transform: 'translateY(-4px)' },
                        transition: 'all 0.2s'
                      }}
                    >
                      <Box sx={{ color: 'secondary.main', fontSize: '2rem', mb: 1 }}><FiUploadCloud /></Box>
                      <Typography variant="subtitle2" fontWeight={700}>Bulk student Upload</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper 
                      elevation={0}
                      onClick={() => setActiveTab("analytics")}
                      sx={{ 
                        p: 2, borderRadius: 3, textAlign: 'center', cursor: 'pointer',
                        bgcolor: alpha(theme.palette.success.main, 0.05),
                        border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.1),
                        '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1), transform: 'translateY(-4px)' },
                        transition: 'all 0.2s'
                      }}
                    >
                      <Box sx={{ color: 'success.main', fontSize: '2rem', mb: 1 }}><FiTrendingUp /></Box>
                      <Typography variant="subtitle2" fontWeight={700}>Finance Reports</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              <StatsPanel students={students} />
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} lg={8}>
                  <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                    <ChartsPanel students={students} />
                  </Paper>
                </Grid>
                <Grid item xs={12} lg={4}>
                  <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                    <ActivityFeed />
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}

          {activeTab === "students" && (
            <>
              <PageHeader 
                title="Student Management" 
                subtitle="Manage records, track fee payments, and handle student status."
                actions={
                  <>
                    {userRole === 'admin' && <DownloadPaymentsButton />}
                    <DownloadButtons filteredStudents={filtered} />
                  </>
                }
              />
              <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                <FilterBar
                  search={search} setSearch={setSearch}
                  searchId={searchId} setSearchId={setSearchId}
                  selectedClass={selectedClass} setSelectedClass={setSelectedClass}
                  classes={classes}
                  selectedVillage={selectedVillage} setSelectedVillage={setSelectedVillage}
                  villages={villages}
                  selectedBus={selectedBus} setSelectedBus={setSelectedBus}
                  buses={["All", "Bus 1", "Bus 2", "Bus 3", "Bus 4", "Not Applicable"]}
                  hostel={hostel} setHostel={setHostel}
                  dueMin={dueMin} setDueMin={setDueMin}
                  dueMax={dueMax} setDueMax={setDueMax}
                  resetFilters={() => {
                    setSearch(""); setSearchId(""); setSelectedClass("All");
                    setSelectedVillage("All"); setSelectedBus("All"); setHostel("All");
                    setDueMin(""); setDueMax("");
                  }}
                />
              </Paper>
              <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden' }}>
                <StudentTable
                  students={paginated}
                  onEdit={isAdmin ? handleEditRequest : null}
                  onDelete={isAdmin ? handleDeleteRequest : null}
                  onPayment={(isAdmin || canCollectFees) ? (s) => { setPaymentStudent(s); setShowPaymentModal(true); } : null}
                  page={page}
                  rowsPerPage={rowsPerPage}
                />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', bgcolor: 'background.paper' }}>
                  <Pagination 
                    count={Math.ceil(filtered.length / rowsPerPage)} 
                    page={page} 
                    onChange={(_, val) => setPage(val)}
                    color="primary"
                    shape="rounded"
                    size={isMobile ? "small" : "medium"}
                  />
                </Box>
              </Paper>
            </>
          )}

          {activeTab === "alumni" && (
            <>
              <PageHeader 
                title="Alumni Vault" 
                subtitle="View graduated students and track their final outstanding dues."
                actions={<DownloadButtons filteredStudents={filtered} />}
              />
              <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                <FilterBar
                  search={search} setSearch={setSearch}
                  searchId={searchId} setSearchId={setSearchId}
                  selectedClass={selectedClass} setSelectedClass={setSelectedClass}
                  classes={classes}
                  selectedVillage={selectedVillage} setSelectedVillage={setSelectedVillage}
                  villages={villages}
                  selectedBus={selectedBus} setSelectedBus={setSelectedBus}
                  buses={["All", "Bus 1", "Bus 2", "Bus 3", "Bus 4", "Not Applicable"]}
                  hostel={hostel} setHostel={setHostel}
                  dueMin={dueMin} setDueMin={setDueMin}
                  dueMax={dueMax} setDueMax={setDueMax}
                  resetFilters={() => {
                    setSearch(""); setSearchId(""); setSelectedClass("All");
                    setSelectedVillage("All"); setSelectedBus("All"); setHostel("All");
                    setDueMin(""); setDueMax("");
                  }}
                />
              </Paper>
              <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden' }}>
                <StudentTable
                  students={paginated}
                  onEdit={null} // No editing alumni core info here
                  onDelete={isAdmin ? handleDeleteRequest : null}
                  onPayment={(isAdmin || canCollectFees) ? (s) => { setPaymentStudent(s); setShowPaymentModal(true); } : null}
                  page={page}
                  rowsPerPage={rowsPerPage}
                />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', bgcolor: 'background.paper' }}>
                  <Pagination 
                    count={Math.ceil(filtered.length / rowsPerPage)} 
                    page={page} 
                    onChange={(_, val) => setPage(val)}
                    color="primary"
                    shape="rounded"
                    size={isMobile ? "small" : "medium"}
                  />
                </Box>
              </Paper>
            </>
          )}

          {activeTab === "promotion" && (
            <>
              <PageHeader title="Academic & Data Management" subtitle="Bulk promote students or migrate large datasets." />
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Academic Promotion</Typography>
                    <BulkPromotion showNotification={setNotification} />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Bulk Data Migration</Typography>
                    <BulkUpload onUploadSuccess={refreshStudents} />
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}

          {activeTab === "admissions" && (
            <>
              <PageHeader title="Admission Records" subtitle="Review and print detailed student admission forms." />
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <AdmissionsList />
              </Paper>
            </>
          )}

          {activeTab === "analytics" && (
            <>
              <PageHeader title="Finance & Analytics" subtitle="Insightful reports on revenue, collections, and outstanding dues." />
              <FinanceReport />
            </>
          )}

          {activeTab === "logs" && (
            <>
              <PageHeader title="Audit Logs" subtitle="Tracking administrative actions for security and transparency." />
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <ActivityFeed />
              </Paper>
            </>
          )}

          {activeTab === "feeconfig" && (
            <>
              <PageHeader title="Fee Configuration" subtitle="Set default annual tuition and bus fees for classes and locations." />
              <FeeSettings />
            </>
          )}

          {activeTab === "teachers" && (
            <>
              <PageHeader title="Staff Management" subtitle="Manage teacher accounts and class permissions." />
              <TeacherManagement showNotification={setNotification} />
            </>
          )}

          {activeTab === "system" && (
            <>
              <PageHeader title="System & Maintenance" subtitle="Configure staff access, promotions, backups, and data migration." />
              <Grid container spacing={3}>
                {userRole === 'admin' && (
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>Staff Command Center</Typography>
                      <TeacherManagement showNotification={setNotification} />
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={12} md={userRole === 'admin' ? 6 : 12}>
                  <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Academic Promotion</Typography>
                    <BulkPromotion showNotification={setNotification} />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ bgcolor: 'primary.lighter', p: 2, borderRadius: 2, color: 'primary.main', fontSize: '1.5rem' }}>
                      <FiDatabase />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={700}>Database Backup</Typography>
                      <Typography variant="body2" color="text.secondary">Export all data to an Excel backup file.</Typography>
                    </Box>
                    <BackupButton />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ bgcolor: 'warning.lighter', p: 2, borderRadius: 2, color: 'warning.main', fontSize: '1.5rem' }}>
                      <FiRefreshCw />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={700}>Yearly Rollover</Typography>
                      <Typography variant="body2" color="text.secondary">Start a new academic year session.</Typography>
                    </Box>
                    <Button variant="outlined" color="warning" onClick={handleRolloverRequest} startIcon={<FiRefreshCw />}>Rollover</Button>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Bulk Data Migration</Typography>
                    <BulkUpload onUploadSuccess={refreshStudents} />
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}

          {activeTab === "danger" && (
            <>
              <PageHeader 
                title="Danger Zone" 
                subtitle="Highly destructive system actions. Proceed with extreme caution."
                actions={<Chip label="ADMIN ONLY" color="error" variant="filled" sx={{ fontWeight: 900 }} />}
              />
              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 3, md: 6 }, 
                  borderRadius: 4, 
                  border: '2px solid', 
                  borderColor: 'error.main',
                  bgcolor: alpha(theme.palette.error.main, 0.02),
                  textAlign: 'center'
                }}
              >
                <Box sx={{ color: 'error.main', fontSize: '5rem', mb: 3 }}>
                  <GiNuclearBomb />
                </Box>
                
                <Typography variant="h3" fontWeight={900} color="error.main" gutterBottom>
                  NUCLEAR SYSTEM RESET
                </Typography>
                
                <Typography variant="h6" sx={{ mb: 4, maxWidth: 700, mx: 'auto', fontWeight: 600 }}>
                  Executing a Nuclear Reset will wipe all student data, financial records, admissions, and attendance logs. 
                  The system will return to a completely empty state.
                </Typography>

                <Box sx={{ 
                  p: 3, mb: 4, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2, 
                  maxWidth: 600, mx: 'auto', border: '1px dashed red' 
                }}>
                  <Typography variant="body2" color="error" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Consequences:
                  </Typography>
                  <ul style={{ textAlign: 'left', display: 'inline-block', color: theme.palette.text.secondary }}>
                    <li>All student records will be permanently deleted.</li>
                    <li>All fee structures and payments will be wiped.</li>
                    <li>All audit logs and notifications will be cleared.</li>
                    <li><strong>This action cannot be undone.</strong></li>
                  </ul>
                </Box>

                <Button 
                  variant="contained" 
                  color="error" 
                  size="large"
                  startIcon={<GiNuclearBomb />}
                  onClick={handleNuclearRequest}
                  sx={{ 
                    px: 6, py: 2, borderRadius: 3, fontWeight: 900, fontSize: '1.2rem',
                    boxShadow: '0 8px 24px rgba(244, 63, 94, 0.4)',
                    '&:hover': { bgcolor: '#D32F2F', transform: 'scale(1.02)' }
                  }}
                >
                  INITIALIZE NUCLEAR RESET
                </Button>
              </Paper>
            </>
          )}
        </Container>
      </Box>

      {/* Modals & Portals */}
      {showPasswordModal && (
        <PasswordModal 
          onConfirm={handlePasswordSuccess}
          onClose={() => { setShowPasswordModal(false); setPendingAction(null); }}
        />
      )}
      {showEdit && (
        <StudentEditModal
          student={selectedStudent}
          onClose={() => setShowEdit(false)}
          onSave={() => { refreshStudents(); setShowEdit(false); setNotification("Student updated."); }}
        />
      )}
      {showPaymentModal && paymentStudent && (
        <FeePaymentModal
          student={paymentStudent}
          onClose={() => setShowPaymentModal(false)}
          onPaid={() => { setShowPaymentModal(false); refreshStudents(); setNotification("Payment successful!"); }}
        />
      )}
      {notification && (
        <Notification message={notification} onClose={() => setNotification("")} />
      )}
    </Box>
  );
}
