import { IMAGE_TYPE } from "./enums";

export type LibraryImageData = {
  src: ImageBitmap;
  extension: string;
  inputLabel: string;
  size: number;
  type: IMAGE_TYPE;
  isFixBorder: boolean;
  polygons: Uint16Array[];
  triangles: Uint8Array[];
  triangleCount: number;
};

export type LibraryFile = {
  id: string;
  label: string;
  type: number;
  children?: LibraryFile[];
  data: LibraryImageData;
};

export type ImageFileData = {
  buffer: ArrayBuffer;
  type: string;
  label: string;
  size: number;
  index: number;
};
