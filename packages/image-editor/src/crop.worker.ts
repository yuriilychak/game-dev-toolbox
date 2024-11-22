import { IMAGE_TYPE } from "./enums";
import type { ImageFileData, LibraryImageData } from "./types";

const canvas: OffscreenCanvas = new OffscreenCanvas(2048, 2048);
const context: OffscreenCanvasRenderingContext2D = canvas.getContext("2d", {
  willReadFrequently: true,
});

function getIndex(x: number, y: number, width: number) {
  return ((y * width + x) << 2) + 3;
}

async function getImageBitmap(blob: Blob, type: string): Promise<ImageBitmap> {
  let imageBitmap: ImageBitmap = await createImageBitmap(blob);

  if (type === "image/jpeg") {
    return imageBitmap;
  }

  const bitmapSize: Uint16Array = new Uint16Array([
    imageBitmap.width,
    imageBitmap.height,
  ]);
  context.clearRect(0, 0, bitmapSize[0], bitmapSize[0]);
  context.drawImage(imageBitmap, 0, 0);

  const { data }: ImageData = context.getImageData(
    0,
    0,
    bitmapSize[0],
    bitmapSize[1],
  );
  const last: Uint16Array = new Uint16Array([
    bitmapSize[0] - 1,
    bitmapSize[1] - 1,
  ]);
  const min: Int16Array = new Int16Array([-1, -1]);
  const max: Int16Array = new Int16Array([-1, -1]);
  const indices: Uint32Array = new Uint32Array([0, 0]);
  let y: number = 0;
  let x: number = 0;

  for (y = 0; y < bitmapSize[1]; ++y) {
    if (min[1] !== -1 && max[1] !== -1) {
      break;
    }

    for (x = 0; x < bitmapSize[0]; ++x) {
      indices[0] = getIndex(x, y, bitmapSize[0]);
      indices[1] = getIndex(x, last[1] - y, bitmapSize[0]);

      if (data[indices[0]] > 0 && min[1] === -1) {
        min[1] = y;
      }

      if (data[indices[1]] > 0 && max[1] === -1) {
        max[1] = last[1] - y;
      }

      if (min[1] !== -1 && max[1] !== -1) {
        break;
      }
    }
  }

  for (x = 0; x < bitmapSize[0]; ++x) {
    if (min[0] !== -1 && max[0] !== -1) {
      break;
    }

    for (y = min[1]; y <= max[1]; ++y) {
      indices[0] = getIndex(x, y, bitmapSize[0]);
      indices[1] = getIndex(last[0] - x, y, bitmapSize[0]);

      if (data[indices[0]] > 0 && min[0] === -1) {
        min[0] = x;
      }

      if (data[indices[1]] > 0 && max[0] === -1) {
        max[0] = last[0] - x;
      }

      if (min[0] !== -1 && max[0] !== -1) {
        break;
      }
    }
  }

  if (
    min[0] == -1 ||
    (min[0] === 0 && min[1] === 0 && max[0] === last[0] && max[1] === last[1])
  ) {
    return imageBitmap;
  }

  bitmapSize[0] = max[0] - min[0] + 1;
  bitmapSize[1] = max[1] - min[1] + 1;

  const widthOffset: number = bitmapSize[0] << 2;
  const croppedData = new Uint8ClampedArray(widthOffset * bitmapSize[1]);
  let sourceStart: number = 0;
  let targetStart: number = 0;

  for (y = 0; y < bitmapSize[1]; ++y) {
    sourceStart = ((min[1] + y) * imageBitmap.width + min[0]) << 2;
    targetStart = y * widthOffset;
    croppedData.set(
      data.subarray(sourceStart, sourceStart + widthOffset),
      targetStart,
    );
  }

  const croppedImageData = new ImageData(
    croppedData,
    bitmapSize[0],
    bitmapSize[1],
  );

  return await createImageBitmap(croppedImageData);
}

self.onmessage = async function (e: MessageEvent<ImageFileData>) {
  const { buffer, type, size, label } = e.data;
  const blob = new Blob([buffer], { type });
  const imageBitmap: ImageBitmap = await getImageBitmap(blob, type);
  const labelSplit = label.split(".");
  const extension = labelSplit.pop().toUpperCase();
  const inputLabel = labelSplit.join(".").substring(0, 32);
  const polygon: Uint16Array = new Uint16Array([
    0,
    0,
    imageBitmap.width,
    0,
    imageBitmap.width,
    imageBitmap.height,
    0,
    imageBitmap.height,
  ]);
  const triangles: Uint8Array = new Uint8Array([0, 1, 2, 0, 2, 3]);
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
