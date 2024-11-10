import { memo } from "react";

import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

import { FILE_COMPONENTS } from "./constants";
import { SingleFileComponent } from "../types";
import { SharedSection } from "../shared-section";

const FileEdit: SingleFileComponent = ({ file }) => (
  <SharedSection
    file={file}
    componentMap={FILE_COMPONENTS}
    Icon={AutoFixHighIcon}
    title="Edit"
  />
);

export default memo(FileEdit);
