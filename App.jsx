import * as React from 'react';
import {Routes, Route, Link, Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

const drawerWidth = 240;

// Dummy page components
function Inbox() {
  return <Typography variant="h6">Contacts</Typography>;
}

function Starred() {
  return <Typography variant="h6">Starred Page</Typography>;
}

function SendEmail() {
  return <Typography variant="h6">Send Email Page</Typography>;
}

function Drafts() {
  return <Typography variant="h6">Drafts Page</Typography>;
}

function AllMail() {
  return <Typography variant="h6">All Mail Page</Typography>;
}

function Trash() {
  return <Typography variant="h6">Trash Page</Typography>;
}

// function Spam() {
//   return <Typography variant="h6">Spam Page</Typography>;
// }

// Layout component with drawer and outlet
function Layout() {
  const mainLinks = [
    { text: 'Contact Admin', path: '/inbox' },
    
  ];

  const secondaryLinks = [
    // { text: 'All mail', path: '/all-mail' },
    // { text: 'Trash', path: '/trash' },
    // { text: 'Spam', path: '/spam' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {mainLinks.map((item, index) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.path}>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {secondaryLinks.map((item, index) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.path}>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

// App component with routes
export default function App() {
  return (
   
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="inbox" element={<Inbox />} />
          
        </Route>
      </Routes>
 
  );
}
