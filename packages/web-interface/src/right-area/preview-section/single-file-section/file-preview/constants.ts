import { LIBRARY_FILE_TYPE } from "../../../../enums";
import { ImagePreview } from "./image-preview";
import { FolderPreview } from "./folder-preview";
import { TextureAtlasPreview } from "./texture-atlas-preview";
import { SingleFileComponent } from "../types";

export const PREVIEW_COMPONENTS: Map<
  LIBRARY_FILE_TYPE,
  SingleFileComponent | null
> = new Map([
  [LIBRARY_FILE_TYPE.IMAGE, ImagePreview as SingleFileComponent],
  [LIBRARY_FILE_TYPE.TEXTURE_ATLAS, TextureAtlasPreview as SingleFileComponent],
  [LIBRARY_FILE_TYPE.NONE, null],
  [LIBRARY_FILE_TYPE.FOLDER, FolderPreview as SingleFileComponent]
]);
