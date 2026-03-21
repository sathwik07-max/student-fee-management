// src/components/StudentTable.js
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Box,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Divider
} from "@mui/material";
import { FiEdit, FiTrash2, FiCreditCard } from "react-icons/fi";

function ConfirmModal({ show, title, children, onConfirm, onCancel }) {
  return (
    <Dialog open={show} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">{children}</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onCancel} color="inherit">Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error">Yes, Delete</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function StudentTable({
  students,
  onEdit,
  onDelete,
  onPayment,
  page = 1,
  rowsPerPage = 10
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(deleteId);
    setShowConfirm(false);
    setDeleteId(null);
  };

  if (!students.length) {
    return (
      <Box sx={{ p: 8, textAlign: 'center' }}>
        <Typography color="text.secondary" variant="h6">No students found matching your filters.</Typography>
      </Box>
    );
  }

  const StatusBadge = ({ finalDue, totalFee }) => {
    if (finalDue <= 0) return <Chip label="Paid" size="small" color="success" sx={{ fontWeight: 700 }} />;
    if (finalDue < totalFee) return <Chip label="Partial" size="small" color="warning" sx={{ fontWeight: 700 }} />;
    return <Chip label="Due" size="small" color="error" sx={{ fontWeight: 700 }} />;
  };

  // Mobile View: Card List
  if (isMobile) {
    return (
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {students.map((s, idx) => {
          const finalDue = Number(s["final due"] || 0);
          const totalFee = Number(s["total"] || 0);
          return (
            <Card key={s["ID.NO"] || idx} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>ID: {s["ID.NO"]}</Typography>
                    <Typography variant="h6" color="primary.main" fontWeight={700}>{s["NAME"]}</Typography>
                  </Box>
                  <StatusBadge finalDue={finalDue} totalFee={totalFee} />
                </Box>
                
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Class: <b>{s["CLASS"]}</b></Typography>
                  <Typography variant="body2" color="text.secondary">Due: <b style={{ color: finalDue > 0 ? theme.palette.error.main : theme.palette.success.main }}>₹{finalDue.toLocaleString()}</b></Typography>
                </Stack>
                
                <Divider sx={{ my: 1.5 }} />
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {onPayment && <Button fullWidth variant="contained" size="small" startIcon={<FiCreditCard />} onClick={() => onPayment(s)}>Pay</Button>}
                  {onEdit && <IconButton size="small" color="primary" onClick={() => onEdit(s)} sx={{ border: '1px solid', borderColor: 'primary.light' }}><FiEdit /></IconButton>}
                  {onDelete && <IconButton size="small" color="error" onClick={() => handleDeleteClick(s["ID.NO"])} sx={{ border: '1px solid', borderColor: 'error.light' }}><FiTrash2 /></IconButton>}
                </Box>
              </CardContent>
            </Card>
          );
        })}
        <ConfirmModal show={showConfirm} title="Delete Record" onConfirm={confirmDelete} onCancel={() => setShowConfirm(false)}>
           Are you sure you want to permanently delete this student's record?
        </ConfirmModal>
      </Box>
    );
  }

  // Desktop View: Table
  return (
    <Box>
      <TableContainer>
        <Table sx={{ minWidth: 1000 }} aria-label="student table">
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>S.No</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>ID No</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total Fee</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Paid</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Final Due</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              {(onPayment || onEdit || onDelete) && <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((s, idx) => {
              const finalDue = Number(s["final due"] || 0);
              const totalFee = Number(s["total"] || 0);
              return (
                <TableRow key={s["ID.NO"] || idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{(page - 1) * rowsPerPage + idx + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{s["ID.NO"]}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="primary.main">{s["NAME"]}</Typography>
                    <Typography variant="caption" color="text.secondary">{s["F.NAME"]}</Typography>
                  </TableCell>
                  <TableCell><Chip label={s["CLASS"]} size="small" variant="outlined" sx={{ fontWeight: 600 }} /></TableCell>
                  <TableCell>{s["PH.NO"]}</TableCell>
                  <TableCell>₹{totalFee.toLocaleString()}</TableCell>
                  <TableCell>₹{Number(s["total pay"] || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Typography fontWeight={700} color={finalDue > 0 ? "error.main" : "success.main"}>
                      ₹{finalDue.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell><StatusBadge finalDue={finalDue} totalFee={totalFee} /></TableCell>
                  {(onPayment || onEdit || onDelete) && (
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {onPayment && <Button variant="contained" size="small" startIcon={<FiCreditCard />} onClick={() => onPayment(s)} sx={{ borderRadius: 1.5 }}>Pay</Button>}
                        {onEdit && <IconButton size="small" color="primary" onClick={() => onEdit(s)}><FiEdit /></IconButton>}
                        {onDelete && <IconButton size="small" color="error" onClick={() => handleDeleteClick(s["ID.NO"])}><FiTrash2 /></IconButton>}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <ConfirmModal show={showConfirm} title="Delete Record" onConfirm={confirmDelete} onCancel={() => setShowConfirm(false)}>
        Are you sure you want to permanently delete this student's record?
      </ConfirmModal>
    </Box>
  );
}

// Helper function for alpha colors
function alpha(color, opacity) {
  return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
}
