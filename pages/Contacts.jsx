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
import { DataGrid,GridToolbar } from "@mui/x-data-grid";

export default function Contacts() {
  const [open, setOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    id: null,
    name_title: "",
    full_name: "",
    phone: "",
    alternate_email: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    contact_type: "",
    organization_name: "",
    job_title: "",
    department: "",
    website: "",
    linkedin: "",
    facebook: "",
    instagram: "",
    whatsapp: "",
    relationship: "",
    notes: "",
    is_favorite: false,
    is_active: true,
  });

  React.useEffect(() => {
    const t = setTimeout(() => {}, 1200);
    return () => clearTimeout(t);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 70, headerAlign: 'center', align: 'center' },
    
    
    {
      field: 'full_name',
      headerName: 'Full Name',
      flex: 1,
      minWidth: 140,
      headerAlign: 'center',
      align: 'center',
      valueGetter:(params, data) => data.name_title+". "+data.full_name,
    },
    {
      field: 'phone',
      headerName: 'Mobile Number',
      flex: 1,
      minWidth: 130,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'whatsapp',
      headerName: 'WhatsApp Number',
      flex: 1,
      minWidth: 150,
      headerAlign: 'center',
      align: 'center',
    },
    
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 180,
      headerAlign: 'center',
      align: 'center',
    },
    // {
    //   field: 'alternate_email',
    //   headerName: 'Alternate Email',
    //   flex: 1,
    //   minWidth: 160,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    
    
    // {
    //   field: 'address',
    //   headerName: 'Address',
    //   flex: 1,
    //   minWidth: 200,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'city',
    //   headerName: 'City',
    //   flex: 1,
    //   minWidth: 120,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'state',
    //   headerName: 'State',
    //   flex: 1,
    //   minWidth: 120,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'postal_code',
    //   headerName: 'Postal Code',
    //   flex: 1,
    //   minWidth: 120,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'country',
    //   headerName: 'Country',
    //   type: 'string',
    //   flex: 1,
    //   minWidth: 120,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'contact_type',
    //   headerName: 'Contact Type',
    //   flex: 1,
    //   minWidth: 140,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'organization_name',
    //   headerName: 'Organization Name',
    //   flex: 1,
    //   minWidth: 150,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'job_title',
    //   headerName: 'Job Title',
    //   flex: 1,
    //   minWidth: 140,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'department',
    //   headerName: 'Department',
    //   flex: 1,
    //   minWidth: 140,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'website',
    //   headerName: 'Website',
    //   flex: 1,
    //   minWidth: 150,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'linkedin',
    //   headerName: 'LinkedIn Profile',
    //   flex: 1,
    //   minWidth: 150,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'facebook',
    //   headerName: 'Facebook Profile',
    //   flex: 1,
    //   minWidth: 150,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'instagram',
    //   headerName: 'Instagram Profile',
    //   flex: 1,
    //   minWidth: 150,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    
    // {
    //   field: 'relationship',
    //   headerName: 'Relationship',
    //   flex: 1,
    //   minWidth: 120,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'notes',
    //   headerName: 'Notes',
    //   flex: 1,
    //   minWidth: 150,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'is_favorite',
    //   headerName: 'Is Favorite',
    //   flex: 1,
    //   minWidth: 100,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'is_active',
    //   headerName: 'Is Active',
    //   flex: 1,
    //   minWidth: 100,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'created_at',
    //   headerName: 'Created At',
    //   flex: 1,
    //   minWidth: 160,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'updated_at',
    //   headerName: 'Updated At',
    //   flex: 1,
    //  minWidth: 160,
    //   headerAlign: 'center',
    //   align: 'center',
     
    // },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 180,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
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
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          overflow: 'auto',
        }}
      >
        <Typography variant="h4">Contacts</Typography>

        <Box sx={{ display: "flex", gap: 2 }} >
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
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Mr">Mr.</MenuItem>
          <MenuItem value="Mrs">Mrs.</MenuItem>
          <MenuItem value="Ms">Ms.</MenuItem>
          <MenuItem value="Miss">Miss.</MenuItem>
          <MenuItem value="Dr">Dr.</MenuItem>
          <MenuItem value="Er">Er.</MenuItem>
          <MenuItem value="Adv">Adv.</MenuItem>
          <MenuItem value="Prof">Prof.</MenuItem>
        </TextField>

        <TextField label="Contact Type" select sx={{ width: 220 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Business">Business</MenuItem>
          <MenuItem value="Personal">Personal</MenuItem>
          <MenuItem value="Company">Company</MenuItem>
          <MenuItem value="Non-Profit">Non-Profit</MenuItem>
          <MenuItem value="School">School</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
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
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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
          overflowx:'auto'
        }}
      >
        <DataGrid
         rows={[]}
         
          columns={columns}
          getRowId={(row) => row.id}
          checkboxSelection
          disableColumnMenu
          disableRowSelectionOnClick

          sx={{
            overflow: 'auto',
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
              backgroundColor: "#f4f6f8",
              fontWeight: "bold",
              fontSize: "0.9rem",
              textAlign: "center",
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.85rem',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: 1.5,
              textAlign: 'center',
              overflowWrap: 'break-word',
              paddingTop: '15px',
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
                <MenuItem value="Mr">Mr.</MenuItem>
                <MenuItem value="Mrs">Mrs.</MenuItem>
                <MenuItem value="Ms">Ms.</MenuItem>
                <MenuItem value="Miss">Miss.</MenuItem>
                <MenuItem value="Dr">Dr.</MenuItem>
                <MenuItem value="Er">Er.</MenuItem>
                <MenuItem value="Adv">Adv.</MenuItem>
                <MenuItem value="Prof">Prof.</MenuItem>
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
                onChange={handleChange}
                fullWidth
                select
                sx={{ width: "200px" }}
              >
               
                <MenuItem value="">Select Country</MenuItem>
                <MenuItem value="USA">USA</MenuItem>
                <MenuItem value="Canada">Canada</MenuItem>
                
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                fullWidth
                select
                sx={{ width: "200px" }}
              >
                
                <MenuItem value="">Select State</MenuItem>
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
            </Grid>
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
                <MenuItem value="Business">Business</MenuItem>
                <MenuItem value="Personal">Personal</MenuItem>
                <MenuItem value="Company">Company</MenuItem>
                <MenuItem value="Non-Profit">Non-Profit</MenuItem>
                <MenuItem value="School">School</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
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
