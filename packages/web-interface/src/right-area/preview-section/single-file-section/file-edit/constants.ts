import { LIBRARY_FILE_TYPE } from "../../../../enums";
import { SingleFileComponent } from "../types";
import { FolderEdit } from "./folder-edit";
import { ImageEdit } from "./image-edit";
import { TextureAtlasEdit } from "./texture-atlas-edit";

export const FILE_COMPONENTS: Map<
  LIBRARY_FILE_TYPE,
  SingleFileComponent | null
> = new Map([
  [LIBRARY_FILE_TYPE.IMAGE, ImageEdit as SingleFileComponent],
  [LIBRARY_FILE_TYPE.TEXTURE_ATLAS, TextureAtlasEdit as SingleFileComponent],
  [LIBRARY_FILE_TYPE.NONE, null],
  [LIBRARY_FILE_TYPE.FOLDER, FolderEdit as SingleFileComponent]
]);
