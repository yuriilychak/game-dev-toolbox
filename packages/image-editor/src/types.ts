import { IMAGE_TYPE } from "./enums";

export type LibraryImageData = {
  src: ImageBitmap;
  isFixBorder: boolean;
  extension: string;
  inputLabel: string;
  type: IMAGE_TYPE;
  polygons: Uint16Array[];
  triangles: Uint16Array[];
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

export type ImageTransformWorkerInput = {
  data: LibraryImageData;
  id: string;
  offset: number;
};
export type ImageTransformWorkerResult = { data: LibraryImageData; id: string };
