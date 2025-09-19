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



function ManageTemplatesModal({ open, onClose, templates, setTemplates }) {

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Manage Templates</DialogTitle>
            <DialogContent>
                <List>
                    {templates.map(template => (
                        <ListItem key={template.id}>
                            <ListItemText primary={template.name} secondary={template.components.find(c => c.type === 'BODY')?.text || ''} />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

function EmailTemplateSelector({ templates, setSelectedTemplateName, setSelectedTemplateContent, selectedTemplateContent, setMessage }) {
    const handleTemplateChange = (template) => {
        setSelectedTemplateName(template.name);
        const bodyComponent = template.components.find(c => c.type === 'BODY');
        if (bodyComponent && bodyComponent.text) {
            setMessage(bodyComponent.text);
            setSelectedTemplateContent(bodyComponent.text);
        } else {
            setMessage(template.name || '');
            setSelectedTemplateContent(template.name || '');
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, flex: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Select a Template
                </Typography>
                <List sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
                    {templates.map((template) => (
                        <Card
                            key={template.id}
                            sx={{
                                mb: 2,
                                cursor: 'pointer',
                                border: selectedTemplateContent === (template.components.find(c => c.type === 'BODY')?.text || template.name || '') ? '2px solid #1976d2' : '1px solid #ccc',
                                boxShadow: selectedTemplateContent === (template.components.find(c => c.type === 'BODY')?.text || template.name || '') ? 3 : 1,
                            }}
                            onClick={() => handleTemplateChange(template)}
                        >
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {template.name}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </List>
            </Paper>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, flex: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Template Preview
                </Typography>
                <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: 1, minHeight: 200, whiteSpace: 'pre-wrap' }}>
                    <Typography variant="body1">
                        {selectedTemplateContent || 'please, select the template to display template preview here'}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}

export default function SendEmail() {
  const [emailLogs, setEmailLogs] = useState([]);
  const [scheduledEmails] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scheduledLoading, setScheduledLoading] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplateName, setSelectedTemplateName] = useState('');
  const [selectedTemplateContent, setSelectedTemplateContent] = useState('');

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

    fetch(`${API_BASE_URL}/whatsapp-templates`)
    .then(res => res.json())
    .then(data => {
      if (data.data) {
        setTemplates(data.data);
      }
    })
    .catch(error => console.error('Error fetching whatsapp templates:', error));

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

  const [composerOpen, setComposerOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(dayjs());
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const fileInputRef = useRef(null);

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
  const cancelScheduledEmail = () => {};
  

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

  const handleSelectAll = () => {
    setSelectedContacts(filteredContacts);
  };

  const handleClearSelection = () => {
    setSelectedContacts([]);
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

  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, logId: null });

  const handleDeleteEmailLog = async () => {
    if (!deleteConfirmation.logId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/email/logs/${deleteConfirmation.logId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Email log deleted successfully!', severity: 'success' });
        fetchEmailLogs(); // Refresh the logs
      } else {
        const errorText = await response.text();
        setSnackbar({ open: true, message: `Failed to delete email log: ${errorText}`, severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting email log.', severity: 'error' });
    } finally {
      setDeleteConfirmation({ open: false, logId: null });
    }
  };

  
  const handleTemplateChange = (event) => {
    const selectedTemplate = templates.find(t => t.id === event.target.value);
    if (selectedTemplate) {
        const bodyComponent = selectedTemplate.components.find(c => c.type === 'BODY');
        if (bodyComponent && bodyComponent.text) {
            setMessage(bodyComponent.text);
        } else {
            setMessage(selectedTemplate.name || '');
        }
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
        <Box sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 -1px 3px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Button size="small" onClick={handleSelectAll}>Select All</Button>
            <Button size="small" onClick={handleClearSelection}>Clear Selection</Button>
          </Box>
          <Typography variant="body2" sx={{
            textAlign: 'center',
            fontWeight: 500,
            color: 'primary.main'
          }}>
            {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
          </Typography>
        </Box>
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
              <EmailTemplateSelector
                templates={templates}
                setSelectedTemplateName={setSelectedTemplateName}
                setSelectedTemplateContent={setSelectedTemplateContent}
                selectedTemplateContent={selectedTemplateContent}
                setMessage={setMessage}
              />
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
                           
                            <IconButton
                              size="small"
                              onClick={() => setDeleteConfirmation({ open: true, logId: log.id })}
                            >
                              <DeleteIcon />
                            </IconButton>
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
    
        
     

      {/* Preview modal */}
      

      <ManageTemplatesModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        templates={templates}
        setTemplates={setTemplates}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, logId: null })}
      >
        <DialogTitle>Delete Email Log</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this email log? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmation({ open: false, logId: null })}>Cancel</Button>
          <Button onClick={handleDeleteEmailLog} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
