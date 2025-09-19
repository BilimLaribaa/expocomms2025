import React, { useState, useEffect, useMemo } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Checkbox,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemSecondaryAction,
  Card,
  CardContent,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  AttachFile as AttachFileIcon,
  Preview as PreviewIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  HighlightOff as HighlightOffIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import API_BASE_URL from '../config';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const senderAccounts = ['Account 1', 'Account 2', 'Account 3'];

const steps = ['Select Template', 'Select Contacts', 'Review & Send'];

const PageHeader = () => (
  <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 4 }}>
    <Toolbar>
      <Tooltip title="Back to Dashboard">
        <IconButton edge="start" color="inherit" aria-label="back">
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
      <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
        WhatsApp Bulk Messaging
      </Typography>
      <FormControl sx={{ m: 1, minWidth: 220 }} size="small">
        <InputLabel>Sender Account</InputLabel>
        <Select defaultValue={senderAccounts[0]} label="Sender Account">
          {senderAccounts.map((account) => (
            <MenuItem key={account} value={account}>
              {account}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Toolbar>
  </AppBar>
);

function AddContactModal({ open, onClose, setContacts }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [contactType, setContactType] = useState('');

    const handleSave = () => {
        const newContact = { full_name: name, phone: phone, contact_type: contactType };

        fetch(`${API_BASE_URL}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newContact),
        })
        .then(res => res.json())
        .then(data => {
            setContacts(prevContacts => [...prevContacts, data]);
            setName('');
            setPhone('');
            setContactType('');
            onClose();
        })
        .catch(error => console.error('Error adding contact:', error));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Full Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Phone Number"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Contact Type"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}

function MessageComposerStep({ message, setMessage, templates, setSelectedTemplateName, setSelectedTemplateContent, selectedTemplateContent, templateImageUrl, setTemplateImageUrl }) {
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
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
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
                <TextField
                    fullWidth
                    label="Image URL (for template header)"
                    variant="outlined"
                    value={templateImageUrl}
                    onChange={(e) => setTemplateImageUrl(e.target.value)}
                    sx={{ mb: 2 }}
                />
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

function ContactSelectorStep({ contacts, selectedContacts, setSelectedContacts, openContactModal }) {
  const [selectedTab, setSelectedTab] = useState(0);

  const contactGroups = useMemo(() => {
    const groups = contacts.reduce((acc, contact) => {
      const groupName = contact.contact_type || 'Uncategorized';
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(contact.id);
      return acc;
    }, {});
    return Object.keys(groups).map(groupName => ({
      name: groupName,
      contactIds: groups[groupName],
    }));
  }, [contacts]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleContactToggle = (value) => () => {
    const currentIndex = selectedContacts.indexOf(value);
    const newSelected = [...selectedContacts];
    if (currentIndex === -1) {
      newSelected.push(value);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    setSelectedContacts(newSelected);
  };

  const handleGroupToggle = (contactIds) => () => {
    const newSelected = [...selectedContacts];
    const allContactsInGroupSelected = contactIds.every(id => newSelected.includes(id));

    if (allContactsInGroupSelected) {
      // Deselect all contacts in the group
      contactIds.forEach(id => {
        const index = newSelected.indexOf(id);
        if (index > -1) {
          newSelected.splice(index, 1);
        }
      });
    } else {
      // Select all contacts in the group
      contactIds.forEach(id => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTab === 0) {
      setSelectedContacts(contacts.map(c => c.id));
    } else {
      const allContactIds = contactGroups.flatMap(g => g.contactIds);
      setSelectedContacts([...new Set([...selectedContacts, ...allContactIds])]);
    }
  };

  const handleClearSelection = () => {
    setSelectedContacts([]);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Choose Your Audience
        </Typography>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={openContactModal} sx={{ mb: 2 }}>
            Add New Contact
        </Button>
        <Tabs value={selectedTab} onChange={handleTabChange} variant="fullWidth">
            <Tab icon={<PersonIcon />} label="Contacts" />
            <Tab icon={<GroupIcon />} label="Groups" />
        </Tabs>
        <Box sx={{ my: 2 }}>
            <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search..."
            InputProps={{ startAdornment: <SearchIcon position="start" sx={{ mr: 1 }} /> }}
            />
        </Box>
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {selectedTab === 0 && (
            <List dense>
                {contacts.map((contact) => (
                <ListItem
                    key={contact.id}
                    button
                    onClick={handleContactToggle(contact.id)}
                >
                    <ListItemAvatar>
                    <Avatar>{contact.full_name ? contact.full_name.charAt(0) : ''}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={contact.full_name} secondary={contact.phone} />
                    <Checkbox
                    edge="end"
                    checked={selectedContacts.indexOf(contact.id) !== -1}
                    />
                </ListItem>
                ))}
            </List>
            )}
            {selectedTab === 1 && (
            <List dense>
                {contactGroups.map((group) => (
                <ListItem key={group.name} button onClick={handleGroupToggle(group.contactIds)}>
                    <ListItemText primary={group.name} />
                    <Checkbox
                        edge="end"
                        checked={group.contactIds.every(id => selectedContacts.includes(id))}
                        indeterminate={!group.contactIds.every(id => selectedContacts.includes(id)) && group.contactIds.some(id => selectedContacts.includes(id))}
                    />
                </ListItem>
                ))}
            </List>
            )}
        </Box>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button size="small" onClick={handleSelectAll}>Select All</Button>
            <Button size="small" onClick={handleClearSelection}>Clear Selection</Button>
            <Typography variant="body2" color="text.secondary">
            {selectedContacts.length} contacts selected
            </Typography>
        </Box>
    </Paper>
  );
}

function ReviewSendStep({ message, selectedContacts, schedule, setSchedule }) {
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Review & Schedule
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>Message Preview</Typography>
          <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
            <Typography variant="body2">{message || 'No message composed.'}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>Summary</Typography>
          <Box>
            <Chip label={`${selectedContacts.length} Contacts Selected`} sx={{ mb: 1 }} />
            <Chip label="No file attached" />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Scheduling
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Schedule Date & Time"
              value={schedule}
              onChange={(newValue) => setSchedule(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Timezone</InputLabel>
            <Select defaultValue="UTC" label="Timezone">
              <MenuItem value="UTC">UTC</MenuItem>
              <MenuItem value="PST">PST</MenuItem>
              <MenuItem value="EST">EST</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
}


export default function SendWhatsapp() {
  const [activeStep, setActiveStep] = useState(0);
  const [message, setMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [schedule, setSchedule] = useState(dayjs().add(1, 'hour'));
  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedTemplateName, setSelectedTemplateName] = useState('');
  const [selectedTemplateContent, setSelectedTemplateContent] = useState('');
  const [templateImageUrl, setTemplateImageUrl] = useState('');
  


  useEffect(() => {
    fetch(`${API_BASE_URL}/contacts`)
      .then(res => res.json())
      .then(data => setContacts(data))
      .catch(error => console.error('Error fetching contacts:', error));

    fetch(`${API_BASE_URL}/whatsapp-templates`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setTemplates(data.data);
        }
      })
      .catch(error => console.error('Error fetching whatsapp templates:', error));
  }, []);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleScheduleSend = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToastMessage('Message scheduled successfully!');
      setShowSuccessToast(true);
      setActiveStep(0);
      setMessage('');
      setSelectedContacts([]);
    }, 2000);
  };

  const handleSendNow = () => {
    setLoading(true);

    const selectedContactDetails = selectedContacts.map(contactId => {
        if (typeof contactId === 'string' && contactId.startsWith('manual_')) {
            return { id: contactId, phone: contactId.replace('manual_', '') };
        }
        return contacts.find(c => c.id === contactId);
    });

    const promises = selectedContactDetails.map(contact => {
        if (contact && contact.phone) {
            const payload = { to: contact.phone, template: selectedTemplateName, imageUrl: templateImageUrl };

            return fetch(`${API_BASE_URL}/send-whatsapp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
        }
        return Promise.resolve(); // Resolve for contacts without phone numbers
    });

    Promise.all(promises)
        .then(responses => {
            setLoading(false);
            const failedCount = responses.filter(res => res && !res.ok).length;
            if (failedCount > 0) {
                setToastMessage(`${failedCount} messages failed to send.`);
            } else {
                setToastMessage('Messages sent successfully!');
            }
            setShowSuccessToast(true);
            setActiveStep(0);
            setMessage('');
            setSelectedContacts([]);
        })
        .catch(error => {
            setLoading(false);
            setToastMessage('An error occurred while sending messages.');
            setShowSuccessToast(true);
            console.error('Error sending whatsapp messages:', error);
        });
    };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <MessageComposerStep message={message} setMessage={setMessage} templates={templates} setSelectedTemplateName={setSelectedTemplateName} setSelectedTemplateContent={setSelectedTemplateContent} selectedTemplateContent={selectedTemplateContent} templateImageUrl={templateImageUrl} setTemplateImageUrl={setTemplateImageUrl} />;
      case 1:
        return <ContactSelectorStep contacts={contacts} selectedContacts={selectedContacts} setSelectedContacts={setSelectedContacts} openContactModal={() => setContactModalOpen(true)} />;
      case 2:
        return <ReviewSendStep message={message} selectedContacts={selectedContacts} schedule={schedule} setSchedule={setSchedule} />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <PageHeader />
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={12} md={12}>
          {getStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Box>
                {activeStep < steps.length - 1 && (
                <Button variant="contained" onClick={handleNext}>
                    Next
                </Button>
                )}
                {activeStep === steps.length - 1 && (
                    <Box sx={{display: 'flex', gap: 2}}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleScheduleSend}
                            disabled={loading || !message || selectedContacts.length === 0}
                            startIcon={<ScheduleIcon />}
                        >
                            {loading ? 'Scheduling...' : 'Schedule Send'}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSendNow}
                            disabled={loading || !message || selectedContacts.length === 0}
                            startIcon={<SendIcon />}
                        >
                            {loading ? 'Sending...' : 'Send Now'}
                        </Button>
                    </Box>
                )}
            </Box>
          </Box>
        </Grid>
      </Grid>
   
      <AddContactModal open={contactModalOpen} onClose={() => setContactModalOpen(false)} setContacts={setContacts} />
      <Snackbar
        open={showSuccessToast}
        autoHideDuration={6000}
        onClose={() => setShowSuccessToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccessToast(false)} severity="success" sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}