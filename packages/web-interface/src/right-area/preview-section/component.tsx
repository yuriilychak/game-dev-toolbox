import { memo, FC, useContext } from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { PreviewContext } from "../../contexts";

const PreviewSection: FC = () => {
  const { selectedFiles } = useContext(PreviewContext);
  const isSingleFile = selectedFiles.length === 1;

  return (
    <Stack padding={0.5} gap={1}>
      <Typography>Properties</Typography>
    </Stack>
  );
};

export default memo(PreviewSection);
