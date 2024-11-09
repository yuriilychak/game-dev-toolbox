import { FC, memo } from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { LibraryFile } from "../../../types";
import { LIBRARY_ITEM_ICONS } from "../../../constants";
import { FilePreview } from "./file-preview";

type SingleFileSectionProps = {
  file: LibraryFile;
};

const SingleFileSection: FC<SingleFileSectionProps> = ({ file }) => {
  const Icon = LIBRARY_ITEM_ICONS.get(file.type);

  return (
    <Stack gap={0.5}>
      <Stack direction="row" gap={0.5}>
        <Icon fontSize="small" />
        <Typography noWrap>{file.label}</Typography>
      </Stack>
      <FilePreview file={file} />
    </Stack>
  );
};

export default memo(SingleFileSection);
