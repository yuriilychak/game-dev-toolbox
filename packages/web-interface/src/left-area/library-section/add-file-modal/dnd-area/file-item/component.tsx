import { FC, useCallback, memo } from "react";

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SvgIcon from "@mui/material/SvgIcon";
import DeleteIcon from "@mui/icons-material/Delete";

import { LibraryFile } from "../../../../../types";

type FileItemProps = {
  AppIcon: typeof SvgIcon;
  file: LibraryFile;
  onRemove(id: string): void;
};

const FileItem: FC<FileItemProps> = ({ AppIcon, file, onRemove }) => {
  const handleRemove = useCallback(() => onRemove(file.id), [file.id]);

  return (
    <Stack
      key={file.label}
      direction="row"
      gap={1}
      width="100%"
      alignItems="center"
    >
      <AppIcon />
      <Typography noWrap>{file.label}</Typography>
      <Box flex={1} />
      <IconButton onClick={handleRemove} size="small">
        <DeleteIcon />
      </IconButton>
    </Stack>
  );
};

export default memo(FileItem);
