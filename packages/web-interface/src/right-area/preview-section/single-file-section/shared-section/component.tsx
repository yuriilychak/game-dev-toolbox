import { FC, memo } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SvgIcon from "@mui/material/SvgIcon";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { SingleFileComponent } from "../types";
import { LibraryFile } from "../../../../types";
import { LIBRARY_FILE_TYPE } from "../../../../enums";

type SharedSectionProps = {
  file: LibraryFile;
  componentMap: Map<LIBRARY_FILE_TYPE, SingleFileComponent | null>;
  Icon: typeof SvgIcon;
  title: string;
};

const FilePreview: FC<SharedSectionProps> = ({
  file,
  componentMap,
  Icon,
  title
}) => {
  const Component = componentMap.get(file.type) as SingleFileComponent | null;

  return Component !== null ? (
    <Accordion defaultExpanded disableGutters elevation={2}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="previewSection"
        id="previewSection"
      >
        <Stack direction="row" gap={0.5}>
          <Icon fontSize="small" />
          <Typography>{title}</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Component file={file} />
      </AccordionDetails>
    </Accordion>
  ) : null;
};

export default memo(FilePreview);
