import { memo, FC, useContext } from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { PreviewContext } from "../../contexts";
import { SingleFileSection } from "./single-file-section";

const PreviewSection: FC = () => {
  const { selectedFiles } = useContext(PreviewContext);
  const isSingleFile = selectedFiles.length === 1;

  return (
    <Stack padding={0.5} gap={1}>
      <Typography>Properties</Typography>
      {isSingleFile && <SingleFileSection file={selectedFiles[0]} />}
    </Stack>
  );
};

export default memo(PreviewSection);
