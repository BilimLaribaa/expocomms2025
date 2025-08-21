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

export default function Contacts() {
  const titles = ["All","Mr.","Mrs.","Ms.","Miss.","Dr.","Er.","Adv.","Prof.",];
  const types = ["Business","Personal","Company","Non-Profit","School","Other",];
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
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [countries, setCountries] = React.useState([]);
  const [states, setStates] = React.useState([]);
  const [cities, setCities] = React.useState([]);

  React.useEffect(() => {
    fetch("https://countriesnow.space/api/v0.1/countries/states")
      .then(response => response.json())
      .then(data => {
        setCountries(data.data);
      })
      .catch(error => console.error('Error fetching countries:', error));
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
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    setSnackbarOpen(true);
    setOpen(false);
  };

  //column

  

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
          <Button variant="contained" color="primary" onClick={handleOpen}>
            Create
          </Button>

          <Button variant="outlined" component="label" color="secondary">
            Import from Excel
            <input type="file" accept=".xlsx, .xls" hidden />
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField label="Title" select sx={{ width: 220 }}>
          {titles.map((title) => (
            <MenuItem key={title} value={title}>
              {title}
            </MenuItem>
          ))}
        </TextField>

        <TextField label="Contact Type" select sx={{ width: 220 }}>
          {types.map((type) => (
            <MenuItem
              key={type}
              value={type === "All" ? "" : type.replace(".", "")}
            >
              {type}
            </MenuItem>
          ))}
        </TextField>

        <TextField label="State" select sx={{ width: 220 }}>
          <MenuItem value="">All</MenuItem>
        </TextField>

        <TextField label="City" select sx={{ width: 220 }}>
          <MenuItem value="">All</MenuItem>
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
          Contact successfully added!
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
          rows={[]}
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
          <DialogTitle>Add Contact</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <TextField
                  label="Title"
                  name="name_title"
                  value={formData.name_title}
                  onChange={handleChange}
                  sx={{ width: "100px" }}
                  select
                >
                  {titles.map((title) => (
                    <MenuItem key={title} value={title}>
                      {title}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={9}>
                <TextField
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "720px" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Mobile Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "410px" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="WhatsApp Number"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "410px" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "410px" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Alternate Email"
                  name="alternate_email"
                  value={formData.alternate_email}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "410px" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Country"
                  name="country"
                  value={formData.country}
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
              {/* <Grid item xs={6}>
                <TextField
                  label="State"
                  name="state"
                  value={formData.state}
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
                  value={formData.city}
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
                  value={formData.postal_code}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "195px" }}
                />
              </Grid> */}
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  name="address"
                  value={formData.address}
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
                  value={formData.contact_type}
                  onChange={handleChange}
                  fullWidth
                  select
                  sx={{ width: "133px" }}
                >
                  <MenuItem value="">Select Type</MenuItem>
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
                  value={formData.organization_name}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "230px" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Job Title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "190px" }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="LinkedIn"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "190px" }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Facebook"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: "190px" }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Relationship"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_favorite}
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
                      checked={formData.is_active}
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
                  value={formData.notes}
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
              Add
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
}




