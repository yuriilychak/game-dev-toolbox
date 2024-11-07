import { memo } from "react";

import Paper from "@mui/material/Paper";

import { PreviewSection } from "./preview-section";

const RightArea = () => (
  <Paper elevation={3} sx={{ width: 256 }}>
    <PreviewSection />
  </Paper>
);

export default memo(RightArea);
