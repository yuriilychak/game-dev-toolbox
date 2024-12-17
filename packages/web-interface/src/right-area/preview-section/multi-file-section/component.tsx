import { memo } from "react";
import type { FilesComponent } from "../types";
import { getFilesType } from "./helpers";
import { flattenFiles } from "../helpers";
import { LIBRARY_FILE_TYPE } from "../../../enums";
import { ImageSection } from "./image-section";

const COMPONENTS = new Map<LIBRARY_FILE_TYPE, FilesComponent | null>([
  [LIBRARY_FILE_TYPE.IMAGE, ImageSection],
  [LIBRARY_FILE_TYPE.FOLDER, null],
  [LIBRARY_FILE_TYPE.TEXTURE_ATLAS, null],
  [LIBRARY_FILE_TYPE.NONE, null],
]);

const MultiFileSection: FilesComponent = ({ files }) => {
  const editableFiles = flattenFiles(files);
  const fileType = getFilesType(editableFiles);
  const Component = COMPONENTS.get(fileType);

  return Component && <Component files={editableFiles} />;
};

export default memo(MultiFileSection);
