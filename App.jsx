import * as React from "react";
import { Routes, Route, Link, Outlet } from "react-router-dom";
import { Box, Drawer, AppBar, CssBaseline, Toolbar, List, Typography, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton} from "@mui/material";
import ContactsIcon from "@mui/icons-material/Contacts";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";

const WIDE = 240, NARROW = 64;

const Dashboard = () => <Typography variant="h6">Dashboard</Typography>;
const Contacts = () => <Typography variant="h6">Contacts</Typography>;
const SendEmail = () => <Typography variant="h6">Send Email</Typography>;
const SendWhatsapp = () => <Typography variant="h6">Send WhatsApp</Typography>;

function Layout() {
  
  const [open, setOpen] = React.useState(true);

  const nav = [
    { text: "Dashboard", path: "/", icon: <DashboardIcon /> },
    { text: "Contacts", path: "/contacts", icon: <ContactsIcon /> },
    { text: "Send Email", path: "/email", icon: <EmailIcon /> },
    { text: "Send WhatsApp", path: "/whatsapp", icon: <WhatsAppIcon /> },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton  sx={{ color: "white", marginRight: "25px" }} onClick={() => setOpen(!open)}><MenuIcon /></IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Admin Panel</Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: open ? WIDE : NARROW,
          "& .MuiDrawer-paper": {
            width: open ? WIDE : NARROW,
            overflowX: "hidden",
            transition: "width 0.25s",
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <List>
          {nav.map(({ text, path, icon }) => (
            <ListItem key={text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                component={Link}
                to={path}
                sx={{ minHeight: 48, justifyContent: open ? "initial" : "center", px: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : "auto" }}>{icon}</ListItemIcon>
                <ListItemText
                  primary={text}
                  sx={{
                    opacity: open ? 1 : 0,
                    whiteSpace: "nowrap",
                    transition: "opacity 0.2s",
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="email" element={<SendEmail />} />
        <Route path="whatsapp" element={<SendWhatsapp />} />
      </Route>
        <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}
