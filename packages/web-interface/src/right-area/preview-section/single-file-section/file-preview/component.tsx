import { memo } from "react";

import PreviewIcon from "@mui/icons-material/Preview";

import { PREVIEW_COMPONENTS } from "./constants";
import { SingleFileComponent } from "../types";
import { SharedSection } from "../shared-section";

const FilePreview: SingleFileComponent = ({ file }) => (
  <SharedSection
    file={file}
    componentMap={PREVIEW_COMPONENTS}
    Icon={PreviewIcon}
    title="Preview"
  />
);

export default memo(FilePreview);
