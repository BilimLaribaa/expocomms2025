import * as React from "react";
import { Typography } from "@mui/material";

export default function Contacts() {
  // To see the loader, simulate latency:
   React.useEffect(() => { const t=setTimeout(()=>{}, 1200); return () => clearTimeout(t); }, []);
  return <Typography variant="h6">Contacts</Typography>;
}