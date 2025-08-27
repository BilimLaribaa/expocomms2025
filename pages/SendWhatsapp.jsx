import React, { useState } from 'react';
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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// For more advanced charts, consider a library like Recharts or Chart.js

const initialTemplates = [
    { id: 1, name: 'Welcome Message', content: 'Hi {{name}}, welcome to our service!' },
    { id: 2, name: 'Promotional Offer', content: 'Hello {{name}}, get 20% off on your next purchase!' },
    { id: 3, name: 'Event Reminder', content: 'Hi {{name}}, just a reminder about the event tomorrow.' },
];

const senderAccounts = ['Account 1', 'Account 2', 'Account 3'];

const contacts = [
  { id: 1, name: 'John Doe', phone: '+1234567890' },
  { id: 2, name: 'Jane Smith', phone: '+1987654321' },
  { id: 3, name: 'Peter Jones', phone: '+1122334455' },
];

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
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6">Templates</Typography>
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
                    </Grid>
                    <Grid item xs={12} md={4}>
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
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

function MessageComposerStep({ message, setMessage, templates, openTemplateModal }) {
    const handleTemplateChange = (event) => {
        const selectedTemplate = templates.find(t => t.id === event.target.value);
        if (selectedTemplate) {
            setMessage(selectedTemplate.content);
        }
    };
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{display: 'flex', justifyContent:'space-between', alignItems:'center', mb: 2}}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Craft Your Message
            </Typography>
            <Box sx={{display: 'flex', gap: 1}}>
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
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={openTemplateModal}>
                        Manage
                    </Button>
                </Tooltip>
            </Box>
        </Box>
      <TextField
        multiline
        rows={10}
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here... e.g., Hello {{name}}"
        variant="outlined"
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
  );
}

function ContactSelectorStep({ selectedContacts, setSelectedContacts }) {
  const [selectedTab, setSelectedTab] = useState(0);

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

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Choose Your Audience
        </Typography>
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
                    <Avatar>{contact.name.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={contact.name} secondary={contact.phone} />
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

function AnalysisSection() {
    const recentCampaigns = [
        {
            name: "Welcome Campaign", status: "Completed", date: "2023-10-26",
            analytics: { total: 500, sent: 500, delivered: 480, seen: 450, failed: 20 }
        },
        {
            name: "Q4 Promotion", status: "In Progress", date: "2023-10-27",
            analytics: { total: 1000, sent: 750, delivered: 700, seen: 600, failed: 50 }
        },
        {
            name: "Holiday Special", status: "Scheduled", date: "2023-11-01",
            analytics: { total: 2000, sent: 0, delivered: 0, seen: 0, failed: 0 }
        },
    ];

    return (
        <Box sx={{ mt: 6 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Campaign Analytics
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 ,width:'1000px'}}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Recent Campaigns</Typography>
                        {recentCampaigns.map((campaign, index) => (
                            <Accordion key={index} sx={{ my: 1 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Grid container alignItems="center">
                                        <Grid item xs={6}><Typography>{campaign.name}</Typography></Grid>
                                        <Grid item xs={3}><Typography color="text.secondary">{campaign.date}</Typography></Grid>
                                        <Grid item xs={3}><Chip label={campaign.status} color={campaign.status === 'Completed' ? 'success' : campaign.status === 'In Progress' ? 'warning' : 'default'} /></Grid>
                                    </Grid>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6} sm={3}><Typography>Total: {campaign.analytics.total}</Typography></Grid>
                                        <Grid item xs={6} sm={3}><Typography>Sent: {campaign.analytics.sent}</Typography></Grid>
                                        <Grid item xs={6} sm={3}><Typography>Delivered: {campaign.analytics.delivered}</Typography></Grid>
                                        <Grid item xs={6} sm={3}><Typography>Seen: {campaign.analytics.seen}</Typography></Grid>
                                        <Grid item xs={12}>
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="body2">Delivery Rate</Typography>
                                                <LinearProgress variant="determinate" value={(campaign.analytics.delivered / campaign.analytics.sent) * 100 || 0} />
                                            </Box>
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="body2">Seen Rate</Typography>
                                                <LinearProgress variant="determinate" value={(campaign.analytics.seen / campaign.analytics.delivered) * 100 || 0} color="success" />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
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
  const [templates, setTemplates] = useState(initialTemplates);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

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
    setTimeout(() => {
      setLoading(false);
      setToastMessage('Message sent successfully!');
      setShowSuccessToast(true);
      setActiveStep(0);
      setMessage('');
      setSelectedContacts([]);
    }, 2000);
    };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <MessageComposerStep message={message} setMessage={setMessage} templates={templates} openTemplateModal={() => setTemplateModalOpen(true)} />;
      case 1:
        return <ContactSelectorStep selectedContacts={selectedContacts} setSelectedContacts={setSelectedContacts} />;
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
      <Grid container justifyContent="center">
        <Grid item xs={12} md={10} lg={8}>
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
      <AnalysisSection />
      <ManageTemplatesModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        templates={templates}
        setTemplates={setTemplates}
      />
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