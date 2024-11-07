import { FC, memo } from "react";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

const TopArea: FC = () => (
  <Paper
    elevation={3}
    sx={{
      padding: 1,
      boxSizing: "border-box",
      borderBottom: "1px solid #555",
    }}
  >
    <Box component="img" src="assets/icon.svg" height={16} width={16} />
  </Paper>
);

export default memo(TopArea);
