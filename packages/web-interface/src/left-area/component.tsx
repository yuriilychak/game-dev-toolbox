import { FC, memo } from "react";

import Paper from "@mui/material/Paper";

import { LibrarySection } from "./library-section";

const LeftArea: FC = () => (
  <Paper elevation={3} sx={{ width: 256 }}>
    <LibrarySection />
  </Paper>
);

export default memo(LeftArea);
