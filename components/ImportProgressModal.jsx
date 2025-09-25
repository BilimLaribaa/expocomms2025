
import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';

export default function ImportProgressModal({ open, progress, totalContacts, importedCount }) {
  const displayProgress = totalContacts > 0 ? (importedCount / totalContacts) * 100 : progress;

  return (
    <Dialog open={open} fullWidth maxWidth="sm">
      <DialogTitle>Importing Contacts</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
          {totalContacts > 0 && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Imported: {importedCount} / {totalContacts}
            </Typography>
          )}
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress variant="determinate" value={displayProgress} />
          </Box>
          <Box sx={{ minWidth: 35, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">{`${Math.round(
              displayProgress
            )}%`}</Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
