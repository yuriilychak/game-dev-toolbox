import { memo } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PreviewIcon from "@mui/icons-material/Preview";

import { LibraryFile } from "../../../../types";
import { PREVIEW_COMPONENTS } from "./constants";
import { TypedPreviewComponent } from "./types";

const FilePreview: TypedPreviewComponent = ({ file }) => {
  const Component = PREVIEW_COMPONENTS.get(
    file.type,
  ) as TypedPreviewComponent | null;

  return Component !== null ? (
    <Accordion defaultExpanded disableGutters elevation={2}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="previewSection"
        id="previewSection"
      >
        <Stack direction="row" gap={0.5}>
          <PreviewIcon fontSize="small" />
          <Typography>Preview</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Component file={file} />
      </AccordionDetails>
    </Accordion>
  ) : null;
};

export default memo(FilePreview);
