import * as React from "react";
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Snackbar,
  TextField,
  Checkbox,
  FormControlLabel,
  Accordion, 
  AccordionSummary,
  AccordionDetails, 
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; 
import MuiAlert from "@mui/material/Alert";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from 'xlsx'; 
import API_BASE_URL from '../config.js';

import { useNavigate } from 'react-router-dom'; // Import useNavigate

export default function Contacts() {
  const navigate = useNavigate(); // Initialize useNavigate
  const titles = ["All","Mr","Mrs","Ms","Miss","Dr","Er","Adv","Prof",];
  const types = ["All","Business","Personal","Company","Non-Profit","School","Other",];
  const visible = ["id", "full_name", "email", "phone", "whatsapp", "actions"]
  const fields = [
    { name: "id", label: "ID", type: "text", tableOnly: true },
    {
      name: "name_title",
      label: "Title",
      type: "select",
      options: ["Mr", "Mrs", "Ms", "Miss", "Dr", "Er", "Adv", "Prof"],
      section: "Personal Info",
      xs: 4,
    },
    { name: "full_name", label: "Full Name", type: "text", section: "Personal Info", xs: 8, required: true },
    { name: "phone", label: "Mobile Number", type: "text", section: "Personal Info", xs: 6, required: true },
    { name: "whatsapp", label: "WhatsApp Number", type: "text", section: "Personal Info", xs: 6, required: true },
    { name: "email", label: "Email", type: "text", section: "Personal Info", xs: 6, required: true },
    { name: "alternate_email", label: "Alternate Email", type: "text", section: "Personal Info", xs: 6 },
    { name: "relationship", label: "Relationship", type: "text", section: "Personal Info", xs: 12 },
    { name: "address", label: "Address", type: "multiline", section: "Personal Info", xs: 12 },
    { name: "city", label: "City", type: "select", options: [], section: "Address", xs: 6 },
    { name: "state", label: "State", type: "select", options: [], section: "Address", xs: 6 },
    { name: "postal_code", label: "Postal Code", type: "text", section: "Address", xs: 6 },
    {
      name: "country",
      label: "Country",
      type: "select",
      options: ["USA", "Canada"],
      section: "Address",
      xs: 6,
    },
    {
      name: "contact_type",
      label: "Contact Type",
      type: "select",
      options: types,
      section: "Contact Type",
      xs: 12,
    },
    { name: "organization_name", label: "Organization Name", type: "text", section: "Professional Info", xs: 6 },
    { name: "job_title", label: "Job Title", type: "text", section: "Professional Info", xs: 6 },
    { name: "department", label: "Department", type: "text", section: "Professional Info", xs: 6 },
    { name: "website", label: "Website", type: "text", section: "Professional Info", xs: 6 },
    { name: "linkedin", label: "LinkedIn", type: "text", section: "Social Media", xs: 4 },
    { name: "facebook", label: "Facebook", type: "text", section: "Social Media", xs: 4 },
    { name: "instagram", label: "Instagram", type: "text", section: "Social Media", xs: 4 },
    { name: "notes", label: "Notes", type: "multiline", section: "Status", xs: 12 },
    { name: "is_favorite", label: "Is Favorite", type: "checkbox", section: "Status", xs: 6 },
    { name: "is_active", label: "Is Active", type: "checkbox", section: "Status", xs: 6 },

    { name: "created_at", label: "Created At", type: "text", tableOnly: true },
    { name: "updated_at", label: "Updated At", type: "text", tableOnly: true },
  ];
  
  // Form state
  const [formData, setFormData] = React.useState({});
  
  const [errors, setErrors] = React.useState({});

  //Form Modal
  const [open, setOpen] = React.useState(false);
  const [editingContactId, setEditingContactId] = React.useState(null); 

  const handleOpen = (contact = null) => {
    if (contact) {
      const newFormData = { ...contact };
      fields.forEach(field => {
        if (field.type !== 'checkbox' && newFormData[field.name] === null) {
          newFormData[field.name] = '';
        }
      });
      setFormData(newFormData);
      setEditingContactId(contact.id);
    } else {
      setFormData({});
      setEditingContactId(null);
    }
    setErrors({});
    
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setFormData({}); 
    setEditingContactId(null); 
  };

  const [countries, setCountries] = React.useState([]);
  const [states, setStates] = React.useState([]);
  const [cities, setCities] = React.useState([]);
  const [contacts, setContacts] = React.useState([]); 

  const fetchContacts = async () => {
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
    }
  };

  React.useEffect(() => {
    fetch("https://countriesnow.space/api/v0.1/countries/states")
      .then(response => response.json())
      .then(data => {
        setCountries(data.data);
      })
      .catch(error => console.error('Error fetching countries:', error));
    fetchContacts(); // Fetch contacts when component mounts
  }, []);

  const handleCountryChange = (e) => {
    const countryName = e.target.value;
    setFormData(prev => ({ ...prev, country: countryName, state: '', city: '' }));
    const countryData = countries.find(c => c.name === countryName);
    if (countryData) {
      setStates(countryData.states);
      setCities([]);
    } else {
      setStates([]);
      setCities([]);
    }
  };

  const handleStateChange = (e) => {
    const stateName = e.target.value;
    const countryName = formData.country;
    setFormData(prev => ({ ...prev, state: stateName, city: '' }));
    if (countryName && stateName) {
      fetch(`https://countriesnow.space/api/v0.1/countries/state/cities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          country: countryName,
          state: stateName
        })
      })
        .then(response => response.json())
        .then(data => {
          setCities(data.data);
        })
        .catch(error => console.error('Error fetching cities:', error));
    } else {
      setCities([]);
    }
  };

  //Snackbar
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState(""); // New state for Snackbar message
  const handleSnackbarClose = () => setSnackbarOpen(false);

  // Filter states
  const [filterTitle, setFilterTitle] = React.useState("");
  const [filterContactType, setFilterContactType] = React.useState("");
  const [filterState, setFilterState] = React.useState("");
  const [filterCity, setFilterCity] = React.useState("");
  const [filterCountry, setFilterCountry] = React.useState(""); // New state for Country filter

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
   fields.forEach(field => {
    const value = formData[field.name];

    if (field.name === 'full_name' && (!value || value.trim() === '')) {
      newErrors[field.name] = 'empty name not allowed';
    }

    else if (field.name === 'phone' && (!value || value.trim() === '')) {
      newErrors[field.name] = 'mobile number is required';
    }

    else if (field.name === 'whatsapp' && (!value || value.trim() === '')) {
      newErrors[field.name] = 'whatsapp number is required';
    }

    else if (field.required && !value) {
      newErrors[field.name] = `${field.label} is required`;
    }

   if ((field.name === 'phone' || field.name === 'whatsapp') && value) {
  const cleaned = value.replace(/[^0-9+ ]/g, ''); 

  if (cleaned.length > 15) {
    newErrors[field.name] = 'Number must be 15 characters or less';
  }
}

  });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      let response;
      let method;
      let url;
      let message;

      if (editingContactId) {
        // Editing existing contact
        method = 'PUT';
        url = `${API_BASE_URL}/contacts/${editingContactId}`;
        message = "Contact successfully updated!";
      } else {
        // Creating new contact
        method = 'POST';
        url = `${API_BASE_URL}/contacts`;
        message = "Contact successfully added!";
      }

      response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Contact ${editingContactId ? 'updated' : 'created'} successfully:`, result);
        setSnackbarMessage(message); 
        setSnackbarOpen(true);
        setOpen(false);
        fetchContacts(); 
        setFormData({}); 
        setEditingContactId(null); 
      } else {
        const errorData = await response.json();
        console.error(`Failed to ${editingContactId ? 'update' : 'create'} contact:`, errorData.error);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
     
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Contact deleted successfully:', id);
        setSnackbarMessage("Contact successfully deleted!"); 
        setSnackbarOpen(true); 
        fetchContacts(); 
      } else {
        console.error('Failed to delete contact:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Map Excel data to contact object structure
        const importedContacts = json.slice(1).map(row => ({
          name_title: row[0] || "",
          full_name: row[1] || "",
          phone: String(row[2] || ""),
          whatsapp: String(row[3] || ""),
          email: row[4] || "",
          alternate_email: row[5] || "",
          address: row[6] || "",
          city: row[7] || "",
          state: row[8] || "",
          postal_code: String(row[9] || ""),
          country: row[10] || "",
          contact_type: row[11] || "",
          organization_name: row[12] || "",
          job_title: row[13] || "",
          department: row[14] || "",
          website: row[15] || "",
          linkedin: row[16] || "",
          facebook: row[17] || "",
          instagram: row[18] || "",
          relationship: row[19] || "",
          notes: row[20] || "",
          is_favorite: row[21] === 1,
          is_active: row[22] === 1,
        }));

        try {
          const response = await fetch(`${API_BASE_URL}/contacts/bulk-import`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(importedContacts),
          });

          if (response.ok) {
            console.log('Contacts imported successfully:', importedContacts.length);
            setSnackbarMessage(`${importedContacts.length} contacts imported successfully!`);
            setSnackbarOpen(true);
            fetchContacts(); // Refresh the contact list
          } else {
            console.error('Failed to import contacts:', response.statusText);
            setSnackbarMessage("Failed to import contacts.");
            setSnackbarOpen(true);
          }
        } catch (error) {
          console.error('Error importing contacts:', error);
          setSnackbarMessage("Error importing contacts.");
          setSnackbarOpen(true);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };
  // Filtering logic
  const filteredContacts = contacts.filter((contact) => {
    return (
      (filterTitle === "" || contact.name_title === filterTitle) &&
      (filterContactType === "" || contact.contact_type === filterContactType) &&
      (filterState === "" || contact.state === filterState) &&
      (filterCity === "" || contact.city === filterCity) &&
      (filterCountry === "" || contact.country === filterCountry)
    );
  });

  const columns = fields
    .filter((f) => !f.formOnly) 
    .map((f) => ({
      field: f.name,
      headerName: f.label,
      flex: 1,
      minWidth: 140,
      headerAlign: "center",
      align: "center",
    }))
    .concat([
      {
        field: "actions",
        headerName: "Actions",
        flex: 1,
        minWidth: 180,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <Button
              onClick={() => handleOpen(params.row)}
              variant="outlined"
              size="small"
              color="primary"
            >
              Edit
            </Button>
            <Button
              onClick={() => handleDelete(params.row.id)}
              variant="outlined"
              size="small"
              color="error"
            >
              Delete
            </Button>
          </Box>
        ),
      },
    ]);

  const accordionSections = [
    {
      name: "General",
      subSections: ["Personal Info", "Contact Type"],
    },
    {
      name: "Info",
      subSections: ["Professional Info", "Social Media", "Address"],
    },
    {
      name: "Status",
      subSections: ["Status"],
    },
  ];

  const [expandedAccordion, setExpandedAccordion] = React.useState("General");

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const getFieldStyle = (fieldName) => {
    switch (fieldName) {
      case 'name_title':
        return { minWidth: '150px' };
      case 'country':
      case 'state':
      case 'city':
      case 'contact_type':
        return { minWidth: '200px' };
      default:
        return {};
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          overflow: "auto",
        }}
      >
        <Typography variant="h4">Contacts</Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" color="primary" onClick={() => handleOpen()}>
            Create
          </Button>

          <Button variant="outlined" component="label" color="secondary">
            Import from Excel
            <input type="file" accept=".xlsx, .xls" hidden onChange={onFileChange} />
          </Button>

          <Button variant="outlined" color="info" href="/excelformat/contacts_format.xlsx" download>
            Download Excel Format
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField label="Title" select sx={{ width: 100 }}
          value={filterTitle}
          onChange={(e) => setFilterTitle(e.target.value)}
        >
          {titles.map((title, index) => (
            <MenuItem key={index} value={title === "All" ? "" : title}>
              {title}
            </MenuItem>
          ))}
        </TextField>

        <TextField label="Contact Type" select sx={{ width: 200 }}
          value={filterContactType}
          onChange={(e) => setFilterContactType(e.target.value)}
        >
          {types.map((type, index) => (
            <MenuItem
              key={index}
              value={type === "All" ? "" : type.replace(".", "")}
            >
              {type}
            </MenuItem>
          ))}
        </TextField>
<TextField label="Country" select sx={{ width: 220 }}
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {countries.map((country, index) => (
            <MenuItem key={index} value={country.name}>
              {country.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField label="State" select sx={{ width: 200 }}
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {states.map((state, index) => (
            <MenuItem key={index} value={state.name}>
              {state.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField label="City" select sx={{ width: 220 }}
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {cities.map((city, index) => (
            <MenuItem key={index} value={city}>
              {city}
            </MenuItem>
          ))}
        </TextField>

        
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity="success"
          elevation={6}
          variant="filled"
        >
          {snackbarMessage} {/* Display dynamic message */}
        </MuiAlert>
      </Snackbar>

      {/* DataGrid */}
      <Box
        sx={{
          height: 600,
          width: "100%",
          minWidth: 0,
          mt: 3,
          borderRadius: 2,
          bgcolor: "white",
          boxShadow: 3,
          position: 'relative',
        }}
      >
        <div style={{ overflow: 'auto', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'block', boxSizing: 'border-box' }}>
          <DataGrid
            rows={filteredContacts}
            columns={columns}
            getRowId={(row) => row.id}
            checkboxSelection
            disableColumnMenu
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            disableExtendRowFullWidth={true}
          initialState={{
    columns: {
      columnVisibilityModel: Object.fromEntries(
        columns.map((col) => [
          col.field,
          visible.includes(col.field),
        ])
      ),
    },
  }}
            sx={{
              border: "none",
              "& .MuiDataGrid-main": {
                tableLayout: 'fixed',
              },
              "& .MuiDataGrid-columnHeaders": {
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
                backgroundColor: "#f4f6f8",
                fontWeight: "bold",
                fontSize: "0.9rem",
                textAlign: "center",
              },
              "& .MuiDataGrid-cell": {
                fontSize: "0.85rem",
                wordBreak: "break-word",
                whiteSpace: "normal",
                lineHeight: 1.5,
                textAlign: "center",
                overflowWrap: "break-word",
                paddingTop: "15px",
              },
            }}
            showToolbar
          />
        </div>
      </Box>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>{editingContactId ? "Edit Contact" : "Add Contact"}</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {accordionSections.map((accordionSection) => (
              <Accordion
                key={accordionSection.name}
                expanded={expandedAccordion === accordionSection.name}
                onChange={handleAccordionChange(accordionSection.name)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ backgroundColor: 'lightgray' }}
                >
                  <Typography>{accordionSection.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {fields
                      .filter((field) =>
                        accordionSection.subSections.includes(field.section)
                      )
                      .map((field, index) => (
                        <Grid item xs={field.xs} key={index}>
                          {field.type === "select" ? (
                            <TextField
                              label={field.label}
                              name={field.name}
                              value={formData[field.name] || ""}
                              onChange={
                                field.name === "country"
                                  ? handleCountryChange
                                  : field.name === "state"
                                  ? handleStateChange
                                  : handleChange
                              }
                              fullWidth
                              select
                              sx={getFieldStyle(field.name)}
                              error={!!errors[field.name]}
                              helperText={errors[field.name]}
                            >
                              <MenuItem value="">{`Select ${field.label}`}</MenuItem>
                              {
                                field.name === "country"
                                  ? countries.map((c, i) => (
                                      <MenuItem key={i} value={c.name}>
                                        {c.name}
                                      </MenuItem>
                                    ))
                                  : field.name === "state"
                                  ? states.map((s, i) => (
                                      <MenuItem key={i} value={s.name}>
                                        {s.name}
                                      </MenuItem>
                                    ))
                                  : field.name === "city"
                                  ? cities.map((c, i) => (
                                      <MenuItem key={i} value={c}>
                                        {c}
                                      </MenuItem>
                                    ))
                                  : field.name === "contact_type"
                                  ? types.map((type, i) => (
                                      <MenuItem
                                        key={i}
                                        value={type === "All" ? "" : type.replace(".", "")}
                                      >
                                        {type}
                                      </MenuItem>
                                    ))
                                  : field.options.map((opt, i) => (
                                      <MenuItem key={i} value={opt === "All" ? "" : opt}>
                                        {opt}
                                      </MenuItem>
                                    ))
                              }
                            </TextField>
                          ) : field.type === "multiline" ? (
                            <TextField
                              label={field.label}
                              name={field.name}
                              value={formData[field.name] || ""}
                              onChange={handleChange}
                              fullWidth
                              multiline
                              rows={2}
                              error={!!errors[field.name]}
                              helperText={errors[field.name]}
                              sx={{ minWidth: '540px' }}
                            />
                          ) : field.type === "checkbox" ? (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={formData[field.name] || false}
                                  onChange={handleChange}
                                  name={field.name}
                                />
                              }
                              label={field.label}
                            />
                          ) : (
                            <TextField
                              label={field.label}
                              name={field.name}
                              value={formData[field.name] || ""}
                              onChange={handleChange}
                              fullWidth
                              error={!!errors[field.name]}
                              helperText={errors[field.name]}
                            />
                          )}
                        </Grid>
                      ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {editingContactId ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
}
