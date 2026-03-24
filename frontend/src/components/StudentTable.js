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
  Divider,
  alpha,
  Avatar,
  Grid
} from "@mui/material";
import { FiEdit, FiTrash2, FiCreditCard, FiPhone, FiBookOpen } from "react-icons/fi";

function ConfirmModal({ show, title, children, onConfirm, onCancel }) {
  return (
    <Dialog 
      open={show} 
      onClose={onCancel} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, p: 1 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem' }}>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>{children}</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onCancel} variant="text" sx={{ color: 'text.secondary' }}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error" sx={{ borderRadius: 2.5, fontWeight: 700 }}>Yes, Delete</Button>
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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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
      <Box sx={{ p: 10, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
        <Typography sx={{ color: 'text.disabled', fontWeight: 700, fontSize: '1.1rem' }}>No student records found.</Typography>
      </Box>
    );
  }

  const StatusBadge = ({ finalDue, totalFee }) => {
    let color = "success";
    let label = "Paid";
    let icon = null;

    if (finalDue > 0) {
      if (finalDue < totalFee) {
        color = "warning";
        label = "Partial";
      } else {
        color = "error";
        label = "Due";
      }
    }

    return (
      <Chip 
        label={label} 
        size="small" 
        color={color} 
        sx={{ 
          fontWeight: 800, 
          fontSize: '0.7rem', 
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          height: 24,
          px: 0.5,
          borderRadius: 1.5,
          bgcolor: alpha(theme.palette[color].main, 0.1),
          color: theme.palette[color].dark,
          border: '1px solid',
          borderColor: alpha(theme.palette[color].main, 0.2)
        }} 
      />
    );
  };

  // Mobile View: Card List
  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {students.map((s, idx) => {
          const finalDue = Number(s["final due"] || 0);
          const totalFee = Number(s["total"] || 0);
          return (
            <Card 
              key={s["ID.NO"] || idx} 
              elevation={0} 
              sx={{ 
                borderRadius: 4, 
                border: '1px solid', 
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:active': { transform: 'scale(0.98)' }
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 800, fontSize: '0.9rem', width: 44, height: 44, borderRadius: 2 }}>
                       {s["NAME"]?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>{s["NAME"]}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>ID: {s["ID.NO"]} • Class {s["CLASS"]}</Typography>
                    </Box>
                  </Box>
                  <StatusBadge finalDue={finalDue} totalFee={totalFee} />
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                   <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>Father Name</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{s["F.NAME"]}</Typography>
                   </Grid>
                   <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>Final Due</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: finalDue > 0 ? 'error.main' : 'success.main' }}>₹{finalDue.toLocaleString()}</Typography>
                   </Grid>
                </Grid>
                
                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {onPayment && (
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="secondary"
                      size="medium" 
                      startIcon={<FiCreditCard />} 
                      onClick={() => onPayment(s)}
                      sx={{ borderRadius: 2.5, fontWeight: 800 }}
                    >
                      Pay Fees
                    </Button>
                  )}
                  <Stack direction="row" spacing={1}>
                    {onEdit && (
                      <IconButton 
                        size="medium" 
                        onClick={() => onEdit(s)} 
                        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main', borderRadius: 2.5 }}
                      >
                        <FiEdit size={18} />
                      </IconButton>
                    )}
                    {onDelete && (
                      <IconButton 
                        size="medium" 
                        onClick={() => handleDeleteClick(s["ID.NO"])} 
                        sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), color: 'error.main', borderRadius: 2.5 }}
                      >
                        <FiTrash2 size={18} />
                      </IconButton>
                    )}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          );
        })}
        <ConfirmModal show={showConfirm} title="Delete Record" onConfirm={confirmDelete} onCancel={() => setShowConfirm(false)}>
           Are you sure you want to permanently delete this student's record? This action cannot be undone.
        </ConfirmModal>
      </Box>
    );
  }

  // Desktop View: Table
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 1000 }} aria-label="student table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 60 }}>#</TableCell>
            <TableCell>Student Detail</TableCell>
            <TableCell>Class Info</TableCell>
            <TableCell>Parent/Contact</TableCell>
            <TableCell align="right">Financial Status</TableCell>
            <TableCell align="center">Status</TableCell>
            {(onPayment || onEdit || onDelete) && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((s, idx) => {
            const finalDue = Number(s["final due"] || 0);
            const totalFee = Number(s["total"] || 0);
            const totalPaid = Number(s["total pay"] || 0);
            return (
              <TableRow key={s["ID.NO"] || idx} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.01) } }}>
                <TableCell>
                   <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 700 }}>
                     {((page - 1) * rowsPerPage + idx + 1).toString().padStart(2, '0')}
                   </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.1), 
                        color: 'primary.main', 
                        fontWeight: 800, 
                        fontSize: '0.875rem', 
                        width: 40, height: 40,
                        borderRadius: 2
                      }}
                    >
                       {s["NAME"]?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.2 }}>{s["NAME"]}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Chip label={`ID: ${s["ID.NO"]}`} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, borderRadius: 1 }} />
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', display: 'flex' }}>
                        <FiBookOpen size={14} />
                     </Box>
                     <Typography variant="body2" sx={{ fontWeight: 700 }}>Class {s["CLASS"]}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{s["F.NAME"]}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                    <FiPhone size={12} /> {s["PH.NO"] || "No Contact"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                   <Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>₹{totalFee.toLocaleString()}</Typography>
                      <Typography variant="caption" sx={{ color: finalDue > 0 ? 'error.main' : 'success.main', fontWeight: 700 }}>
                        {finalDue > 0 ? `₹${finalDue.toLocaleString()} Due` : 'Fully Paid'}
                      </Typography>
                   </Box>
                </TableCell>
                <TableCell align="center">
                  <StatusBadge finalDue={finalDue} totalFee={totalFee} />
                </TableCell>
                {(onPayment || onEdit || onDelete) && (
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {onPayment && (
                        <Button 
                          variant="contained" 
                          color="secondary"
                          size="small" 
                          startIcon={<FiCreditCard />} 
                          onClick={() => onPayment(s)} 
                          sx={{ borderRadius: 2, py: 0.75, px: 2, fontWeight: 800, fontSize: '0.75rem' }}
                        >
                          Pay
                        </Button>
                      )}
                      {onEdit && (
                        <IconButton 
                          size="small" 
                          onClick={() => onEdit(s)}
                          sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04), color: 'primary.main', borderRadius: 2 }}
                        >
                          <FiEdit size={16} />
                        </IconButton>
                      )}
                      {onDelete && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(s["ID.NO"])}
                          sx={{ bgcolor: alpha(theme.palette.error.main, 0.04), color: 'error.main', borderRadius: 2 }}
                        >
                          <FiTrash2 size={16} />
                        </IconButton>
                      )}
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <ConfirmModal show={showConfirm} title="Delete Record" onConfirm={confirmDelete} onCancel={() => setShowConfirm(false)}>
        Are you sure you want to permanently delete this student's record? This action is irreversible.
      </ConfirmModal>
    </Box>
  );
}
