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
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from 'xlsx'; // Import xlsx library

export default function Contacts() {
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
    },
    { name: "full_name", label: "Full Name", type: "text" },
    { name: "phone", label: "Mobile Number", type: "text" },
    { name: "whatsapp", label: "WhatsApp Number", type: "text" },
    { name: "email", label: "Email", type: "text" },
    { name: "alternate_email", label: "Alternate Email", type: "text" },
    { name: "address", label: "Address", type: "multiline" },
    { name: "city", label: "City", type: "select", options: [] },
    { name: "state", label: "State", type: "select", options: [] },
    { name: "postal_code", label: "Postal Code", type: "text" },
    {
      name: "country",
      label: "Country",
      type: "select",
      options: ["USA", "Canada"],
    },
    {
      name: "contact_type",
      label: "Contact Type",
      type: "select",
      options: types,
    },
    { name: "organization_name", label: "Organization Name", type: "text" },
    { name: "job_title", label: "Job Title", type: "text" },
    { name: "department", label: "Department", type: "text" },
    { name: "website", label: "Website", type: "text" },
    { name: "linkedin", label: "LinkedIn", type: "text" },
    { name: "facebook", label: "Facebook", type: "text" },
    { name: "instagram", label: "Instagram", type: "text" },
    { name: "relationship", label: "Relationship", type: "text" },
    { name: "notes", label: "Notes", type: "multiline" },
    { name: "is_favorite", label: "Is Favorite", type: "checkbox" },
    { name: "is_active", label: "Is Active", type: "checkbox" },

    { name: "created_at", label: "Created At", type: "text", tableOnly: true },
    { name: "updated_at", label: "Updated At", type: "text", tableOnly: true },
  ];
  
  // Form state
  const [formData, setFormData] = React.useState({});

  //Form Modal
  const [open, setOpen] = React.useState(false);
  const [editingContactId, setEditingContactId] = React.useState(null); // New state for editing

  const handleOpen = (contact = null) => {
    if (contact) {
      setFormData(contact);
      setEditingContactId(contact.id);
    } else {
      setFormData({});
      setEditingContactId(null);
    }
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setFormData({}); // Clear form data on close
    setEditingContactId(null); // Reset editing state on close
  };

  const [countries, setCountries] = React.useState([]);
  const [states, setStates] = React.useState([]);
  const [cities, setCities] = React.useState([]);
  const [contacts, setContacts] = React.useState([]); // New state for contacts

  const fetchContacts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/contacts');
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
    try {
      let response;
      let method;
      let url;
      let message;

      if (editingContactId) {
        // Editing existing contact
        method = 'PUT';
        url = `http://localhost:3001/api/contacts/${editingContactId}`;
        message = "Contact successfully updated!";
      } else {
        // Creating new contact
        method = 'POST';
        url = 'http://localhost:3001/api/contacts';
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
        setSnackbarMessage(message); // Set the appropriate message
        setSnackbarOpen(true);
        setOpen(false);
        fetchContacts(); // Refresh the contact list
        setFormData({}); // Clear the form after successful submission
        setEditingContactId(null); // Reset editing state
      } else {
        console.error(`Failed to ${editingContactId ? 'update' : 'create'} contact:`, response.statusText);
        // Handle error, show an error message to the user
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle network errors
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/contacts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Contact deleted successfully:', id);
        setSnackbarMessage("Contact successfully deleted!"); // Set delete message
        setSnackbarOpen(true); 
        fetchContacts(); // Refresh the contact list
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
        const json = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel data to contact object structure
        const importedContacts = json.map(row => ({
          name_title: row["Title"] || "",
          full_name: row["Full Name"] || "",
          phone: String(row["Mobile Number"]) || "",
          whatsapp: String(row["WhatsApp Number"]) || "",
          email: row["Email"] || "",
          alternate_email: row["Alternate Email"] || "",
          address: row["Address"] || "",
          city: row["City"] || "",
          state: row["State"] || "",
          postal_code: String(row["Postal Code"]) || "",
          country: row["Country"] || "",
          contact_type: row["Contact Type"] || "",
          organization_name: row["Organization Name"] || "",
          job_title: row["Job Title"] || "",
          department: row["Department"] || "",
          website: row["Website"] || "",
          linkedin: row["LinkedIn"] || "",
          facebook: row["Facebook"] || "",
          instagram: row["Instagram"] || "",
          relationship: row["Relationship"] || "",
          notes: row["Notes"] || "",
          is_favorite: row["Is Favorite"] === 1 ? true : false, // Assuming 1 for true, 0 for false
          is_active: row["Is Active"] === 1 ? true : false, // Assuming 1 for true, 0 for false
        }));

        try {
          const response = await fetch('http://localhost:3001/api/contacts/bulk-import', {
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
      (filterCountry === "" || contact.country === filterCountry) // New filter condition
    );
  });

  const columns = fields
    .filter((f) => !f.formOnly) // exclude form-only fields
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
        </Box>
      </Box>

      {/* Filters */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField label="Title" select sx={{ width: 220 }}
          value={filterTitle}
          onChange={(e) => setFilterTitle(e.target.value)}
        >
          {titles.map((title) => (
            <MenuItem key={title} value={title === "All" ? "" : title}>
              {title}
            </MenuItem>
          ))}
        </TextField>

        <TextField label="Contact Type" select sx={{ width: 220 }}
          value={filterContactType}
          onChange={(e) => setFilterContactType(e.target.value)}
        >
          {types.map((type) => (
            <MenuItem
              key={type}
              value={type === "All" ? "" : type.replace(".", "")}
            >
              {type}
            </MenuItem>
          ))}
        </TextField>

        <TextField label="State" select sx={{ width: 220 }}
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {states.map((state) => (
            <MenuItem key={state.name} value={state.name}>
              {state.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField label="City" select sx={{ width: 220 }}
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {cities.map((city) => (
            <MenuItem key={city} value={city}>
              {city}
            </MenuItem>
          ))}
        </TextField>

        <TextField label="Country" select sx={{ width: 220 }}
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {countries.map((country) => (
            <MenuItem key={country.name} value={country.name}>
              {country.name}
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
          mt: 3,
          borderRadius: 2,
          bgcolor: "white",
          boxShadow: 3,
          overflowx: "auto",
        }}
      >
        <DataGrid
          rows={filteredContacts}
          columns={columns}
          getRowId={(row) => row.id}
          checkboxSelection
          disableColumnMenu
          disableRowSelectionOnClick
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
            overflow: "auto",
            border: "none",
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
      </Box>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>{editingContactId ? "Edit Contact" : "Add Contact"}</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <TextField
                  label="Title"
                  name="name_title"
                  value={formData.name_title || ''}
                  onChange={handleChange}
                  sx={{ width: "100px" }}
                  select
                >
                  {titles.map((title) => (
                    <MenuItem key={title} value={title === "All" ? "" : title}>
                      {title}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={9}>
                <TextField
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "720px" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Mobile Number"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "410px" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="WhatsApp Number"
                  name="whatsapp"
                  value={formData.whatsapp || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "410px" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "410px" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Alternate Email"
                  name="alternate_email"
                  value={formData.alternate_email || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "410px" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Country"
                  name="country"
                  value={formData.country || ''}
                  onChange={handleCountryChange}
                  fullWidth
                  select
                  sx={{ width: "200px" }}
                >
                  <MenuItem value="">Select Country</MenuItem>
                  {countries.map((country) => (
                    <MenuItem key={country.name} value={country.name}>
                      {country.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="State"
                  name="state"
                  value={formData.state || ''}
                  onChange={handleStateChange}
                  fullWidth
                  select
                  sx={{ width: "200px" }}
                >
                  <MenuItem value="">Select State</MenuItem>
                  {states.map((state) => (
                    <MenuItem key={state.name} value={state.name}>
                      {state.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="City"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                  fullWidth
                  select
                  sx={{ width: "190px" }}
                >
                  <MenuItem value="">Select City</MenuItem>
                  {cities.map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Postal Code"
                  name="postal_code"
                  value={formData.postal_code || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "195px" }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ width: "835px" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Contact Type"
                  name="contact_type"
                  value={formData.contact_type || ''}
                  onChange={handleChange}
                  fullWidth
                  select
                  sx={{ width: "133px" }}
                >
                  {types.map((type) => (
                    <MenuItem
                      key={type}
                      value={type === "All" ? "" : type.replace(".", "")}
                    >
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Organization Name"
                  name="organization_name"
                  value={formData.organization_name || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "230px" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Job Title"
                  name="job_title"
                  value={formData.job_title || ''}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Department"
                  name="department"
                  value={formData.department || ''}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Website"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "190px" }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="LinkedIn"
                  name="linkedin"
                  value={formData.linkedin || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "190px" }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Facebook"
                  name="facebook"
                  value={formData.facebook || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "190px" }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Instagram"
                  name="instagram"
                  value={formData.instagram || ''}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Relationship"
                  name="relationship"
                  value={formData.relationship || ''}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_favorite || false}
                      onChange={handleChange}
                      name="is_favorite"
                    />
                  }
                  label="Is Favorite"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_active || false}
                      onChange={handleChange}
                      name="is_active"
                    />
                  }
                  label="Is Active"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  fullWidth
                  sx={{ width: "835px" }}
                />
              </Grid>
            </Grid>
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