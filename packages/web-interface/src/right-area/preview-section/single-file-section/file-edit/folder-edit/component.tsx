import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { flattenFiles } from "../../../helpers";
import { MultiFileSection } from "../../../multi-file-section";
import type { SingleFileComponent } from "../../types";

const FolderEdit: SingleFileComponent<LIBRARY_FILE_TYPE.FOLDER> = ({
  file,
}) => {
  const files = flattenFiles([file]);

  return <MultiFileSection files={files} />;
};

export default FolderEdit;
