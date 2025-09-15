import React, { useState, useEffect } from 'react';
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



const contactGroups = [
  { id: 1, name: 'Family' },
  { id: 2, name: 'Friends' },
  { id: 3, name: 'Work' },
];

const steps = ['Compose Message', 'Select Contacts', 'Review & Send'];

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

    const handleSave = () => {
        const newContact = { full_name: name, phone: phone };

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
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}

function MessageComposerStep({ message, setMessage, templates, setSelectedTemplateName, messageMode, setMessageMode, setSelectedTemplateContent, selectedTemplateContent, templateImageUrl, setTemplateImageUrl }) {
    const handleTemplateChange = (event) => {
        const selectedTemplate = templates.find(t => t.id === event.target.value);
        if (selectedTemplate) {
            setSelectedTemplateName(selectedTemplate.name);
            const bodyComponent = selectedTemplate.components.find(c => c.type === 'BODY');
            if (bodyComponent && bodyComponent.text) {
                setMessage(bodyComponent.text);
                setSelectedTemplateContent(bodyComponent.text);
            } else {
                // If no body component or text, use template name as a fallback message
                setMessage(selectedTemplate.name || '');
                setSelectedTemplateContent(selectedTemplate.name || '');
            }
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            {messageMode === 'template' && selectedTemplateContent && (
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2, flex: 1 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Template Preview
                    </Typography>
                    <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: 1, minHeight: 200, whiteSpace: 'pre-wrap' }}>
                        <Typography variant="body1">
                            {selectedTemplateContent}
                        </Typography>
                    </Box>
                </Paper>
            )}
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Craft Your Message
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={() => setMessageMode('manual')} variant={messageMode === 'manual' ? 'contained' : 'outlined'}>Manual</Button>
                        <Button onClick={() => setMessageMode('template')} variant={messageMode === 'template' ? 'contained' : 'outlined'}>Template</Button>
                    </Box>
                </Box>

                {messageMode === 'template' && (
                    <>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Use Template</InputLabel>
                            <Select onChange={handleTemplateChange} label="Use Template">
                                {templates.map((template) => (
                                    <MenuItem key={template.id} value={template.id}>
                                        {template.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Image URL (for template header)"
                            variant="outlined"
                            value={templateImageUrl}
                            onChange={(e) => setTemplateImageUrl(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                    </>
                )}

                <TextField
                    multiline
                    rows={10}
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    variant="outlined"
                    disabled={messageMode === 'template' && !message}
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Tooltip title="Add Emoji">
                        <IconButton color="primary">
                            <EmojiEmotionsIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Attach File (Image, PDF, Doc)">
                        <IconButton color="primary">
                            <AttachFileIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Preview Message">
                        <Button variant="outlined" startIcon={<PreviewIcon />}>
                            Preview
                        </Button>
                    </Tooltip>
                </Box>
            </Paper>
        </Box>
    );
}

function ContactSelectorStep({ contacts, selectedContacts, setSelectedContacts, openContactModal }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [manualPhone, setManualPhone] = useState('');

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

  const handleAddManualPhone = () => {
    if (manualPhone && !selectedContacts.includes(manualPhone)) {
       
        const tempId = `manual_${manualPhone}`;
        const newSelected = [...selectedContacts, tempId];
        setSelectedContacts(newSelected);

        setManualPhone('');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Choose Your Audience
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
                label="Manually Add Phone Number"
                variant="outlined"
                size="small"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
            />
            <Button onClick={handleAddManualPhone} variant="contained" startIcon={<AddIcon />}>
                Add
            </Button>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={openContactModal}>
                Add New Contact
            </Button>
        </Box>
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
                <ListItem key={group.id} button>
                    <ListItemText primary={group.name} />
                    <Checkbox edge="end" />
                </ListItem>
                ))}
            </List>
            )}
        </Box>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button size="small">Select All</Button>
            <Button size="small">Clear Selection</Button>
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
  const [messageMode, setMessageMode] = useState('manual');
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
            const payload = messageMode === 'template'
                ? { to: contact.phone, template: selectedTemplateName, imageUrl: templateImageUrl }
                : { to: contact.phone, message: message };

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
        return <MessageComposerStep message={message} setMessage={setMessage} templates={templates} setSelectedTemplateName={setSelectedTemplateName} messageMode={messageMode} setMessageMode={setMessageMode} setSelectedTemplateContent={setSelectedTemplateContent} selectedTemplateContent={selectedTemplateContent} templateImageUrl={templateImageUrl} setTemplateImageUrl={setTemplateImageUrl} />;
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