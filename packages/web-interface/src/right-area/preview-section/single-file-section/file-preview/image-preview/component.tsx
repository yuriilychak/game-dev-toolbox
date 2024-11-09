import { memo } from "react";

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

import { formatSize } from "../../../../../helpers";
import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { TypedPreviewComponent } from "../types";
import { StatisticsContainer } from "../statistics-container";

const ImagePreview: TypedPreviewComponent<LIBRARY_FILE_TYPE.IMAGE> = ({
  file,
}) => (
  <StatisticsContainer
    messages={[
      `Format: ${file.data.extension}`,
      `Size: ${formatSize(file.data.size)}`,
      `Width: ${file.data.resolution.width}px`,
      `Height: ${file.data.resolution.height}px`,
    ]}
  >
    <Stack
      justifyContent="center"
      alignItems="center"
      boxSizing="border-box"
      padding={1}
      sx={{
        maxHeight: 128,
        height: 128,
        width: "100%",
        backgroundImage: 'url("assets/checkerPattern.svg")',
        backgroundRepeat: "repeat",
      }}
    >
      <Box component="img" src={file.data.src} sx={{ maxHeight: "100%" }} />
    </Stack>
  </StatisticsContainer>
);

export default memo(ImagePreview);
