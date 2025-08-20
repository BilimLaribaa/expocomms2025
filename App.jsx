import * as React from "react";
import { Routes, Route, NavLink, Outlet } from "react-router-dom";
import {Box, Drawer, AppBar, CssBaseline, Toolbar, List, Typography,ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Tooltip,useMediaQuery, LinearProgress} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ContactsIcon from "@mui/icons-material/Contacts";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";

// ---- Lazy pages ----
const Dashboard   = React.lazy(() => import("./pages/Dashboard"));
const Contacts    = React.lazy(() => import("./pages/Contacts"));
const SendEmail   = React.lazy(() => import("./pages/SendEmail"));
const SendWhatsapp= React.lazy(() => import("./pages/SendWhatsapp"));

// ---- Loaders ----
import { ContentLoader, FallbackLoader, RouteReady } from "./components/Loaders";

const WIDE = 240, NARROW = 64;
const NAV = [
  { text: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { text: "Contacts", path: "/contacts", icon: <ContactsIcon /> },
  { text: "Send Email", path: "/email", icon: <EmailIcon /> },
  { text: "Send WhatsApp", path: "/whatsapp", icon: <WhatsAppIcon /> },
];

function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = React.useState(!isMobile);
  const [routeLoading, setRouteLoading] = React.useState(false);

  React.useEffect(() => { setOpen(!isMobile); }, [isMobile]);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            aria-label="Toggle navigation drawer"
            edge="start"
            onClick={() => setOpen(v => !v)}
            sx={{ color: "white", mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Admin Panel</Typography>
        </Toolbar>
        {routeLoading && <LinearProgress />}
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: open ? WIDE : NARROW,
          "& .MuiDrawer-paper": {
            width: open ? WIDE : NARROW,
            overflowX: "hidden",
            boxSizing: "border-box",
            transition: (t) => t.transitions.create("width", {
              easing: t.transitions.easing.sharp,
              duration: t.transitions.duration.shorter,
            }),
          },
        }}
      >
        <Toolbar />
        <List>
          {NAV.map(({ text, path, icon }) => (
            <ListItem key={text} disablePadding sx={{ display: "block" }}>
              <Tooltip title={!open ? text : ""} placement="right">
                <ListItemButton
                  component={NavLink}
                  to={path}
                  aria-label={`Go to ${text}`}
                  onClick={() => isMobile && setOpen(false)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2,
                    "&.active": { bgcolor: (t) => t.palette.action.selected },
                  }}
                  end={path === "/"}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : "auto" }}>
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    sx={{
                      opacity: open ? 1 : 0,
                      whiteSpace: "nowrap",
                      transition: (t) => t.transitions.create("opacity", {
                        duration: t.transitions.duration.shortest,
                      }),
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <React.Suspense fallback={<FallbackLoader onShow={() => setRouteLoading(true)} />}>
          <RouteReady onReady={() => setRouteLoading(false)}>
            <Outlet />
          </RouteReady>
        </React.Suspense>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="email" element={<SendEmail />} />
        <Route path="whatsapp" element={<SendWhatsapp />} />
      </Route>
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}
