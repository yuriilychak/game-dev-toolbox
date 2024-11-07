import { LIBRARY_FILE_TYPE } from "./enums";

export type LibraryImageData = {
  src: string;
  extension: string;
  size: number;
  resolution: { width: number; height: number };
};

type LibraryFileDataMapping = {
  [LIBRARY_FILE_TYPE.IMAGE]: LibraryImageData;
  [LIBRARY_FILE_TYPE.TEXTURE_ATLAS]: { images: string[]; placement: object[] };
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
