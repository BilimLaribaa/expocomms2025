import * as React from "react";
import { Box, CircularProgress, Skeleton, Stack } from "@mui/material";

/** Big content-area skeleton used while routes lazy-load */
export function ContentLoader() {
  return (
    <Stack spacing={2}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <CircularProgress size={24} />
        <Skeleton variant="text" width={220} height={28} />
      </Box>
      <Skeleton variant="rectangular" height={140} />
      <Skeleton variant="rectangular" height={240} />
      <Skeleton variant="text" width="50%" />
    </Stack>
  );
}

/** Suspense fallback that also toggles the top LinearProgress on */
export function FallbackLoader({ onShow }) {
  React.useEffect(() => { onShow && onShow(); }, [onShow]);
  return <ContentLoader />;
}

/** Renders children and toggles the top LinearProgress off once resolved */
export function RouteReady({ onReady, children }) {
  React.useEffect(() => { onReady && onReady(); }, [onReady]);
  return <>{children}</>;
}
