import { maxInt, minInt, intSign } from "./math";

export function joinCoords(
  x: number,
  y: number,
  clasterSize: number = 16,
): number {
  return x + (y << clasterSize);
}

export function splitCoords(coordData: number): Uint16Array {
  const result = new Uint16Array(2);

  result[1] = coordData >> 16;
  result[0] = coordData - (result[1] << 16);

  return result;
}

export function getCropData(
  imageData: Uint8Array,
  width: number,
  height: number,
): Uint32Array {
  let minX: number = width;
  let maxX: number = 0;
  let minY: number = height;
  let maxY: number = 0;

  let i: number = 0;
  let j: number = 0;
  let vertexIndex: number = 0;
  let rowOffset: number = 0;

  for (i = 0; i < height; ++i) {
    rowOffset = width * i;

    for (j = 0; j < width; ++j) {
      vertexIndex = rowOffset + j;

      if (imageData[(vertexIndex << 2) + 3] !== 0) {
        minX = minInt(j, minX);
        maxX = maxInt(j, maxX);
        minY = minInt(i, minY);
        maxY = maxInt(i, maxY);
      }
    }
  }

  const result = new Uint32Array(2);

  result[0] = joinCoords(minX, minY);
  result[1] = joinCoords(maxX - minX, maxY - minY);

  return result;
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
