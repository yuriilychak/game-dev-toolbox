import { cropImageBitmap, getQuadPolygon } from "./utils";
import { IMAGE_TYPE } from "./enums";
import type { ImageFileData, LibraryImageData } from "./types";
import { QUAD_TRIANGLES } from "./constants";

const canvas: OffscreenCanvas = new OffscreenCanvas(2048, 2048);
const context: OffscreenCanvasRenderingContext2D = canvas.getContext("2d", {
  willReadFrequently: true,
});

self.onmessage = async function (e: MessageEvent<ImageFileData>) {
  const { buffer, type, size, label } = e.data;
  const blob = new Blob([buffer], { type });
  const inputImageBitmap: ImageBitmap = await createImageBitmap(blob);
  const imageBitmap: ImageBitmap = await cropImageBitmap(
    inputImageBitmap,
    type,
    context,
  );
  const labelSplit = label.split(".");
  const extension = labelSplit.pop().toUpperCase();
  const inputLabel = labelSplit.join(".").substring(0, 32);
  const polygon: Uint16Array = getQuadPolygon(imageBitmap);
  const triangles: Uint16Array = QUAD_TRIANGLES.slice();
  const result: LibraryImageData = {
    src: imageBitmap,
    isFixBorder: false,
    extension,
    inputLabel,
    size,
    type: IMAGE_TYPE.QUAD,
    polygons: [polygon],
    triangles: [triangles],
    triangleCount: 2,
  };
  // @ts-ignore
  self.postMessage(result, [imageBitmap]);
};
