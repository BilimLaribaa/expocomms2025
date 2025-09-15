import 'quill/dist/quill.snow.css';

import ReactQuill from 'react-quill';
import dayjs from 'dayjs';
import React, { useState, useRef } from 'react';

import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import API_BASE_URL from '../config';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Modal,
  IconButton,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  InputAdornment,
  Chip,
  Card,
  CardContent,
  Checkbox,
  Tabs,
  Tab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const initialTemplates = [
    { id: 1, name: 'Welcome Message', content: 'Hi {{name}}, welcome to our service!' },
    { id: 2, name: 'Promotional Offer', content: 'Hello {{name}}, get 20% off on your next purchase!' },
    { id: 3, name: 'Event Reminder', content: 'Hi {{name}}, just a reminder about the event tomorrow.' },
];

function ManageTemplatesModal({ open, onClose, templates, setTemplates }) {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [editingTemplate, setEditingTemplate] = useState(null);

    const handleSave = () => {
        if (editingTemplate) {
            setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, name, content } : t));
        } else {
            setTemplates([...templates, { id: Date.now(), name, content }]);
        }
        setName('');
        setContent('');
        setEditingTemplate(null);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setName(template.name);
        setContent(template.content);
    };

    const handleDelete = (id) => {
        setTemplates(templates.filter(t => t.id !== id));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'Manage Templates'}</DialogTitle>
            <DialogContent>
                <Box display="grid" gridTemplateColumns="2fr 1fr" gap={2}>
                    <List>
                        {templates.map(template => (
                            <ListItem key={template.id}>
                                <ListItemText primary={template.name} secondary={template.content} />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(template)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(template.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                    <Box>
                        <Typography variant="h6">{editingTemplate ? 'Edit Template' : 'Add New Template'}</Typography>
                        <TextField
                            label="Template Name"
                            fullWidth
                            margin="normal"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            label="Template Content"
                            fullWidth
                            multiline
                            rows={4}
                            margin="normal"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <Button onClick={handleSave} variant="contained" sx={{ mt: 2 }}>
                            {editingTemplate ? 'Save Changes' : 'Add Template'}
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export default function SendEmail() {
  const [emailLogs, setEmailLogs] = useState([]);
  const [scheduledEmails] = useState([]);
  const [deliveryLogs] = useState([]);
  const [deliveryStats] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scheduledLoading, setScheduledLoading] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [templates, setTemplates] = useState(initialTemplates);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  const fetchEmailLogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/email/logs`);
      if (response.ok) {
        const data = await response.json();
        setEmailLogs(data);
      } else {
        console.error('Failed to fetch email logs:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching email logs:', error);
    }
  };

  React.useEffect(() => {
    const fetchContacts = async () => {
      setContactsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/contacts`);
        if (response.ok) {
          const data = await response.json();
          setContacts(data);
        } else {
          console.error('Failed to fetch contacts:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setContactsLoading(false);
      }
    };

    fetchContacts();
    fetchEmailLogs();
  }, []);

  const [emails, setEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);

  React.useEffect(() => {
    const selectedEmails = selectedContacts.map(c => c.email);
    const manualEmails = emails.split(',').map(e => e.trim()).filter(e => e);
    const allEmails = [...new Set([...manualEmails, ...selectedEmails])];
    setEmails(allEmails.join(', '));
  }, [selectedContacts]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [deliveryTrackingOpen, setDeliveryTrackingOpen] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(dayjs());
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const fileInputRef = useRef(null);

  // Dummy functions for layout purposes
  const handleOpenDeliveryTracking = () => setDeliveryTrackingOpen(true);
  const handleSendEmail = async () => {
    const selectedEmails = selectedContacts.map(c => c.email);
    const manualEmails = emails.split(',').map(e => e.trim()).filter(e => e);
    const allEmails = [...new Set([...manualEmails, ...selectedEmails])];

    if (allEmails.length === 0) {
      setSnackbar({ open: true, message: 'Please select at least one contact or enter an email address.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: allEmails.join(', '),
          subject,
          html: message,
        }),
      });
      if (response.ok) {
        setSnackbar({ open: true, message: 'Email sent successfully!', severity: 'success' });
        setComposerOpen(false);
        setSubject('');
        setMessage('');
        setSelectedContacts([]);
        setEmails('');
        fetchEmailLogs();
      } else {
        const errorText = await response.text();
        setSnackbar({ open: true, message: `Failed to send email: ${errorText}`, severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error sending email.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  const handleAttachmentChange = () => {};
  const removeAttachment = () => {};
  const saveDraft = () => {};
  const loadDraft = () => {};
  const cancelScheduledEmail = () => {};
  const loadDeliveryLogs = () => {};

  const filteredContacts = contacts.filter(contact =>
    contact.full_name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(contactSearchTerm.toLowerCase())
  );

  const handleContactToggle = (contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.find(c => c.id === contact.id);
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'sent': return 'primary';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'bounced': return 'error';
      default: return 'default';
    }
  };

  const getStatusHexColor = (status) => {
    switch (status) {
      case 'delivered': return '#4CAF50';
      case 'sent': return '#2196F3';
      case 'pending': return '#9E9E9E';
      case 'failed': return '#F44336';
      case 'bounced': return '#FF9800';
      default: return '#BDBDBD';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'sent': return 'Sent';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      case 'bounced': return 'Bounced';
      default: return status;
    }
  };

  const pieChartOptions = {
    chart: {
      type: 'pie',
    },
    labels: deliveryStats.map(stat => getStatusLabel(stat.status)),
    colors: deliveryStats.map(stat => getStatusHexColor(stat.status)),
    legend: {
      position: 'bottom',
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const pieChartSeries = deliveryStats.map(stat => stat.count);

  const handleTemplateChange = (event) => {
    const selectedTemplate = templates.find(t => t.id === event.target.value);
    if (selectedTemplate) {
        setMessage(selectedTemplate.content);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Contact Sidebar */}
      <Box sx={{
        width: '300px',
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
      }}>
        {/* Header */}
        <Box sx={{
          p: 3,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h6" sx={{
            fontWeight: 600,
            mb: 2,
            color: 'text.primary',
            fontSize: '1.1rem'
          }}>
            Contacts
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search contacts..."
            value={contactSearchTerm}
            onChange={(e) => setContactSearchTerm(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'grey.50',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
                '&.Mui-focused': {
                  bgcolor: 'white',
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Contact List */}
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          bgcolor: 'grey.50'
        }}>
          {contactsLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <CircularProgress size={32} />
            </Box>
          ) : filteredContacts.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" p={4}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                {contactSearchTerm ? 'No contacts found' : 'No contacts available'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredContacts.map((contact) => {
                const isSelected = selectedContacts.find(c => c.id === contact.id);
                return (
                  <ListItem
                    key={contact.id}
                    onClick={() => handleContactToggle(contact)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      mx: 1,
                      my: 0.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      bgcolor: isSelected ? 'primary.main' : 'transparent',
                      color: isSelected ? 'white' : 'text.primary',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.dark' : 'grey.200',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      },
                      '& .MuiListItemText-primary': {
                        fontWeight: isSelected ? 600 : 500,
                        fontSize: '0.9rem',
                      },
                      '& .MuiListItemText-secondary': {
                        color: isSelected ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                        fontSize: '0.8rem',
                      }
                    }}
                  >
                    <Checkbox
                      checked={!!isSelected}
                      size="small"
                      sx={{
                        mr: 1,
                        color: isSelected ? 'white' : 'primary.main',
                        '&.Mui-checked': {
                          color: isSelected ? 'white' : 'primary.main',
                        }
                      }}
                    />
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: contact.is_favorite ? 'warning.main' : (isSelected ? 'white' : 'primary.main'),
                          color: contact.is_favorite ? 'white' : (isSelected ? 'primary.main' : 'white'),
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        {contact.first_name?.charAt(0).toUpperCase() || ''}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={contact.full_name}
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.75rem',
                              lineHeight: 1.2,
                              mb: 0.5
                            }}
                          >
                            {contact.email}
                          </Typography>
                          {contact.organization_name && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.7rem',
                                opacity: 0.8
                              }}
                            >
                              {contact.organization_name}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>

        {/* Footer with selected count */}
        {selectedContacts.length > 0 && (
          <Box sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: '0 -1px 3px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="body2" sx={{
              textAlign: 'center',
              fontWeight: 500,
              color: 'primary.main'
            }}>
              {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
            </Typography>
          </Box>
        )}
      </Box>

      {/* Email Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Email
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<AnalyticsIcon />}
                onClick={handleOpenDeliveryTracking}
              >
                Delivery Tracking
              </Button>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => setComposerOpen(true)}
              >
                Compose Email
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Email Content */}
        <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
          {/* Selected Contacts Display */}
          {selectedContacts.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Selected Recipients ({selectedContacts.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedContacts.map((contact) => (
                    <Chip
                      key={contact.id}
                      label={contact.full_name}
                      onDelete={() => handleContactToggle(contact)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Email History with Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label={`Sent Emails (${emailLogs.length})`} />
              <Tab label={`Scheduled (${scheduledEmails.length})`} />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Sent Emails History
              </Typography>

              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Recipients</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Message</TableCell>
                        <TableCell>Sent At</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {emailLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.id}</TableCell>
                          <TableCell>{log.recipients}</TableCell>
                          <TableCell>{log.subject}</TableCell>
                          <TableCell><div dangerouslySetInnerHTML={{ __html: log.message }} /></TableCell>
                          <TableCell>{new Date(log.sent_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setDeliveryTrackingOpen(true);
                                loadDeliveryLogs(log.id);
                              }}
                            >
                              View Status
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}

          {activeTab === 1 && (
            <>
              <Typography variant="h6" gutterBottom>
                Scheduled Emails
              </Typography>

              {scheduledLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Recipients</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Message</TableCell>
                        <TableCell>Scheduled For</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* Dummy data for scheduled emails */}
                      <TableRow>
                        <TableCell>1</TableCell>
                        <TableCell>scheduled@example.com</TableCell>
                        <TableCell>Scheduled Subject</TableCell>
                        <TableCell><div dangerouslySetInnerHTML={{ __html: "Scheduled Message" }} /></TableCell>
                        <TableCell>{new Date().toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => cancelScheduledEmail(1)}
                          >
                            Cancel
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Composer Modal */}
      <Modal open={composerOpen} onClose={() => setComposerOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            maxWidth: 980,
            bgcolor: 'background.paper',
            p: 3,
            boxShadow: 24,
            overflowY: 'auto',
            maxHeight: '90%',
            borderRadius: 2,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Compose Email</Typography>
            <IconButton onClick={() => setComposerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Box display="flex" flexDirection="column" gap={2} mb={2}>
            <TextField
              label="Recipient Emails (comma separated)"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              fullWidth
              helperText={`${selectedContacts.length} contact(s) selected`}
            />
            <TextField
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              fullWidth
            />

            <Box sx={{display: 'flex', gap: 1, alignItems: 'center', mb: 1}}>
                <FormControl sx={{ minWidth: 220 }} size="small">
                    <InputLabel>Use Template</InputLabel>
                    <Select onChange={handleTemplateChange} label="Use Template">
                        {templates.map((template) => (
                            <MenuItem key={template.id} value={template.id}>
                            {template.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Tooltip title="Manage Templates">
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setTemplateModalOpen(true)}>
                        Manage
                    </Button>
                </Tooltip>
            </Box>

            {/* Rich editor */}
            <ReactQuill
              value={message}
              onChange={setMessage}
              theme="snow"
              style={{ minHeight: 180, height:"90px" }}
            />

            {/* attachments: hidden input + button */}
            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              accept=".pdf,.docx,.jpg,.jpeg,.png"
              onChange={handleAttachmentChange}
            />
            <Box display="flex" gap={2} alignItems="center" sx={{marginTop:"30px"}}>
              <Button
                variant="outlined"
                startIcon={<AttachFileIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Attachments
              </Button>

              <Box>
                {attachments.map((f, i) => (
                  <Stack direction="row" alignItems="center" spacing={1} key={i} sx={{ mb: 0.5 }}>
                    <Typography variant="body2">📎 {f.name}</Typography>
                    <Button size="small" onClick={() => removeAttachment(i)}>
                      Remove
                    </Button>
                  </Stack>
                ))}
              </Box>
            </Box>

            {/* actions */}
            <Box display="flex" gap={2} mt={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SendIcon />}
                onClick={handleSendEmail}
              >
                Send Now
              </Button>

              <Button
                variant="outlined"
                startIcon={<ScheduleIcon />}
                onClick={() => setScheduleOpen(true)}
              >
                Schedule
              </Button>

              <Button onClick={saveDraft}>Save Draft</Button>
              <Button onClick={loadDraft}>Load Draft</Button>
              <Button onClick={() => setPreviewOpen(true)}>Preview</Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Schedule modal (date-time picker) */}
      <Modal open={scheduleOpen} onClose={() => setScheduleOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 420,
            bgcolor: 'background.paper',
            p: 3,
            boxShadow: 24,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Schedule Email
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
  value={scheduledTime}
  onChange={(v) => setScheduledTime(v)}
  slotProps={{
    textField: {
      fullWidth: true,
    },
  }}
/>
          </LocalizationProvider>

          <Box display="flex" gap={2} mt={2}>
            <Button
                variant="contained"
                onClick={() => {
                  if (!scheduledTime) {
                    setSnackbar({ open: true, message: 'Pick a date/time first', severity: 'error' });
                    return;
                  }
                  setScheduleOpen(false);
                }}
              >
                Schedule Email
              </Button>

            <Button onClick={() => setScheduleOpen(false)}>Cancel</Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>{
          snackbar.message
        }</Alert>
      </Snackbar>

      {/* Delivery Tracking Modal */}
      <Modal open={deliveryTrackingOpen} onClose={() => setDeliveryTrackingOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: 1200,
            bgcolor: 'background.paper',
            p: 3,
            boxShadow: 24,
            overflowY: 'auto',
            maxHeight: '90%',
            borderRadius: 2,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Email Delivery Status & Analytics
            </Typography>
            <IconButton onClick={() => setDeliveryTrackingOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          {/* Delivery Statistics Pie Chart */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Delivery Statistics
              </Typography>
              {statsLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : deliveryStats.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No delivery data available
                </Typography>
              ) : (
                <Box sx={{ height: 300 }}>
                  {/* Placeholder for ReactApexChart */}
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    (Pie Chart Placeholder)
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Delivery Logs Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Delivery Logs
              </Typography>
              {deliveryLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : deliveryLogs.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Click &quot;View Status&quot; on any sent email to see delivery logs
                </Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Recipient</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Sent At</TableCell>
                        <TableCell>Delivered At</TableCell>
                        <TableCell>Failed At</TableCell>
                        <TableCell>Error Message</TableCell>
                        <TableCell>Retry Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* Dummy data for delivery logs */}
                      <TableRow>
                        <TableCell>recipient@example.com</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel('sent')}
                            color={getStatusColor('sent')}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date().toLocaleString()}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>0</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>
      </Modal>

      {/* Preview modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '80%',
            height: '80%',
            bgcolor: 'background.paper',
            p: 4,
            overflowY: 'auto',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Preview</Typography>
            <IconButton onClick={() => setPreviewOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Typography variant="subtitle1">To: {emails}</Typography>
          <Typography variant="subtitle1">Subject: {subject}</Typography>
          <div dangerouslySetInnerHTML={{ __html: message }} />
        </Box>
      </Modal>

      <ManageTemplatesModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        templates={templates}
        setTemplates={setTemplates}
      />
    </Box>
  );
}