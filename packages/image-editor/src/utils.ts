import ImageCropService from "./image-crop-service";
import { ImageFileData, LibraryImageData } from "./types";

export async function formatImageData(
  fileData: ImageFileData[],
): Promise<LibraryImageData[]> {
  return new Promise((resolve, reject) => {
    const workerPool = new ImageCropService();

    workerPool.start(fileData, (result) => resolve(result), reject);
  });
}

function getIndex(x: number, y: number, width: number) {
  return ((y * width + x) << 2) + 3;
}

export async function cropImageBitmap(
  inputImageBitmap: ImageBitmap,
  type: string,
  context: OffscreenCanvasRenderingContext2D,
): Promise<ImageBitmap> {
  if (type.includes("jpeg")) {
    return inputImageBitmap;
  }

  const bitmapSize: Uint16Array = new Uint16Array([
    inputImageBitmap.width,
    inputImageBitmap.height,
  ]);
  context.clearRect(0, 0, bitmapSize[0], bitmapSize[0]);
  context.drawImage(inputImageBitmap, 0, 0);

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
    return inputImageBitmap;
  }

  bitmapSize[0] = max[0] - min[0] + 1;
  bitmapSize[1] = max[1] - min[1] + 1;

  const widthOffset: number = bitmapSize[0] << 2;
  const croppedData = new Uint8ClampedArray(widthOffset * bitmapSize[1]);
  let sourceStart: number = 0;
  let targetStart: number = 0;

  for (y = 0; y < bitmapSize[1]; ++y) {
    sourceStart = ((min[1] + y) * inputImageBitmap.width + min[0]) << 2;
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

export function getQuadPolygon(imageBitmap: ImageBitmap): Uint16Array {
  return new Uint16Array([
    0,
    0,
    imageBitmap.width,
    0,
    imageBitmap.width,
    imageBitmap.height,
    0,
    imageBitmap.height,
  ]);
}

const FIVE_BIT_MASK: number = 0b11111;

export function serializeTriangleIndices(
  index1: number,
  index2: number,
  index3: number,
): number {
  return (
    (index1 & FIVE_BIT_MASK) |
    ((index2 & FIVE_BIT_MASK) << 5) |
    ((index3 & FIVE_BIT_MASK) << 10)
  );
}

export function getTriangleIndex(source: number, index: number): number {
  return (source >> (index * 5)) & FIVE_BIT_MASK;
}
