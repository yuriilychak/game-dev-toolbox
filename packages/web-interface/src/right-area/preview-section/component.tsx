import { memo, FC, useContext, useMemo } from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { PreviewContext } from "../../contexts";
import { SingleFileSection } from "./single-file-section";
import { MultiFileSection } from "./multi-file-section";
import { FilesComponent } from "./types";

const FILE_COMPONENTS: (FilesComponent | null)[] = [
  null,
  SingleFileSection,
  MultiFileSection,
];

const PreviewSection: FC = () => {
  const { selectedFiles } = useContext(PreviewContext);
  const componentIndex = Math.sign(selectedFiles.length - 1) + 1;
  const Component = FILE_COMPONENTS[componentIndex];

  return (
    <Stack padding={0.5} gap={1}>
      <Typography>Properties</Typography>
      {Component !== null && <Component files={selectedFiles} />}
    </Stack>
  );
};

export default memo(PreviewSection);
