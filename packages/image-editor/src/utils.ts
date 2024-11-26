import ImageCropService from "./image-crop-service";
import { intSign } from "./math";
import { ImageFileData, LibraryImageData } from "./types";

export function joinCoords(
  x: number,
  y: number,
  clasterSize: number = 16,
): number {
  return x + (y << clasterSize);
}

export function formatDimension(
  dimension: number,
  clasterSize: number,
): Uint16Array {
  const halfClasterSize: number = clasterSize >> 1;
  const tmpOffset = (((dimension >> 2) + 1) << 2) - dimension;
  const tmpDiff = intSign(halfClasterSize - tmpOffset);
  const dimensionDiff =
    tmpOffset + halfClasterSize * tmpDiff * (1 - tmpDiff) + clasterSize;
  const result = new Uint16Array(3);

  result[0] = dimension + dimensionDiff;
  result[1] = dimensionDiff >> 1;
  result[2] = dimensionDiff - (dimensionDiff >> 1);

  return result;
}

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

export function getQuadPolygonFromRect(rect: Uint16Array): Uint16Array {
  return new Uint16Array([
    rect[0],
    rect[1],
    rect[0] + rect[2],
    rect[1],
    rect[0] + rect[2],
    rect[1] + rect[3],
    rect[0],
    rect[1] + rect[3],
  ]);
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

export function isRectangle(points: Uint16Array): boolean {
  return (
    points.length === 8 &&
    points[0] === points[6] &&
    points[1] === points[3] &&
    points[2] === points[4] &&
    points[5] === points[7]
  );
}

function rectangleArea(rect: Uint16Array): number {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = rect;
  const width = Math.max(x0, x1, x2, x3) - Math.min(x0, x1, x2, x3);
  const height = Math.max(y0, y1, y2, y3) - Math.min(y0, y1, y2, y3);
  return width * height;
}

export function getBoundingBox(
  rect1: Uint16Array,
  rect2: Uint16Array,
): Uint16Array {
  const [x0a, y0a, x1a, y1a, x2a, y2a, x3a, y3a] = rect1;
  const [x0b, y0b, x1b, y1b, x2b, y2b, x3b, y3b] = rect2;
  const xMin = Math.min(
    Math.min(x0a, x1a, x2a, x3a),
    Math.min(x0b, x1b, x2b, x3b),
  );
  const xMax = Math.max(
    Math.max(x0a, x1a, x2a, x3a),
    Math.max(x0b, x1b, x2b, x3b),
  );
  const yMin = Math.min(
    Math.min(y0a, y1a, y2a, y3a),
    Math.min(y0b, y1b, y2b, y3b),
  );
  const yMax = Math.max(
    Math.max(y0a, y1a, y2a, y3a),
    Math.max(y0b, y1b, y2b, y3b),
  );

  return new Uint16Array([xMin, yMin, xMax - xMin, yMax - yMin]);
}

export function differenceBetweenBoundingBoxAndArea(
  rect1: Uint16Array,
  rect2: Uint16Array,
): number {
  const area1 = rectangleArea(rect1);
  const area2 = rectangleArea(rect2);
  const boundBox = getBoundingBox(rect1, rect2);
  const boundingBox = boundBox[2] * boundBox[3];

  return boundingBox - area1 - area2;
}
