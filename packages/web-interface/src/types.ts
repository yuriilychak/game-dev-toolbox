import { IMAGE_TYPE } from "image-editor";

import SvgIcon from "@mui/material/SvgIcon";
import { LIBRARY_FILE_TYPE } from "./enums";

export type LibraryImageData = {
  src: ImageBitmap;
  extension: string;
  size: number;
  width: number;
  height: number;
  type: IMAGE_TYPE;
  polygon: number[];
  triangles: number[];
  triangleCount: number;
};

export type LibraryTextureAtlasData = {
  size: number;
  images: string[];
  placement: object[];
  width: number;
  height: number;
  isGenerated: boolean;
};

type LibraryFileDataMapping = {
  [LIBRARY_FILE_TYPE.IMAGE]: LibraryImageData;
  [LIBRARY_FILE_TYPE.TEXTURE_ATLAS]: LibraryTextureAtlasData;
  [LIBRARY_FILE_TYPE.FOLDER]: null;
  [LIBRARY_FILE_TYPE.NONE]: null;
};

export type LibraryFile<T extends LIBRARY_FILE_TYPE = LIBRARY_FILE_TYPE> = {
  id: string;
  label: string;
  type: T;
  children?: LibraryFile[];
  data: LibraryFileDataMapping[T];
};

export type LibraryContextData = {
  tree: LibraryFile[];
  focusedId: string;
  onTreeChange(middleware: (prevTree: LibraryFile[]) => LibraryFile[]): void;
  onFocusChanged(focusedId: string): void;
  onSelectionChanged(files: LibraryFile[]): void;
};

export type PreviewContextData = {
  selectedFiles: LibraryFile[];
};

export interface FieldOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  Icon?: typeof SvgIcon;
}

export type IconMap<T> = Map<T, typeof SvgIcon>;

export type LocaleMap<T extends number> = Map<T, string>;
