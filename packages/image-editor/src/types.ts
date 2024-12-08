import { IMAGE_TYPE } from "./enums";

export interface ImageWorkerData {
  src: ImageBitmap;
  isFixBorder: boolean;
  polygons: Uint16Array[];
  triangles: Uint16Array[];
}

export interface LibraryImageData extends ImageWorkerData {
  extension: string;
  inputLabel: string;
  type: IMAGE_TYPE;
  polygons: Uint16Array[];
  triangles: Uint16Array[];
}

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
