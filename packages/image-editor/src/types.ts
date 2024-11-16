import { IMAGE_TYPE } from "./enums";

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

export type LibraryFile = {
  id: string;
  label: string;
  type: number;
  children?: LibraryFile[];
  data: LibraryImageData;
};
