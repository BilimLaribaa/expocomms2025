import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

export default function DuplicateContactsModal({ open, onClose, duplicates, nonDuplicates, onSkip, onAdd }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Duplicate Contacts Found</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          The following contacts already exist in your contact list. Do you want to add them anyway or skip them?
        </Typography>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>WhatsApp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {duplicates.map((contact, index) => (
                <TableRow key={index}>
                  <TableCell>{contact.full_name}</TableCell>
                  <TableCell>{contact.duplicateField.email || 'N/A'}</TableCell>
                  <TableCell>{contact.duplicateField.phone || 'N/A'}</TableCell>
                  <TableCell>{contact.duplicateField.whatsapp || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSkip(nonDuplicates)} variant="contained" color="secondary">
          Skip Duplicates
        </Button>
        <Button onClick={() => onAdd(duplicates.concat(nonDuplicates))} variant="contained" color="primary">
          Add All
        </Button>
      </DialogActions>
    </Dialog>
  );
}
