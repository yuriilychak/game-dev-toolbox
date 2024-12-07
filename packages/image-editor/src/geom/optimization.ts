import { cycleIndex } from "../utils";
import Point from "./point";

function getPointInside(pt: Point, polygon: Point[]): boolean {
  let n = polygon.length;
  let inside = false;

  for (let i = 0; i < n; i++) {
    let p1 = polygon[i];
    let p2 = polygon[(i + 1) % n];

    if (isPointOnSegment(pt, p1, p2)) {
      return true;
    }

    if (
      p1.y > pt.y !== p2.y > pt.y &&
      pt.x < ((p2.x - p1.x) * (pt.y - p1.y)) / (p2.y - p1.y) + p1.x
    ) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Перевіряє, чи точка лежить на відрізку
 */
function isPointOnSegment(pt: Point, p1: Point, p2: Point): boolean {
  const crossProduct =
    (pt.y - p1.y) * (p2.x - p1.x) - (pt.x - p1.x) * (p2.y - p1.y);

  if (Math.abs(crossProduct) > Number.EPSILON) {
    return false;
  }

  const dotProduct =
    (pt.x - p1.x) * (p2.x - p1.x) + (pt.y - p1.y) * (p2.y - p1.y);
  if (dotProduct < 0) {
    return false;
  }

  const squaredLength =
    (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);
  if (dotProduct > squaredLength) {
    return false;
  }

  return true;
}

export function getDistanceValid(pt: Point, simplified: Point[]): boolean {
  const pointCount: number = simplified.length;
  let i: number = 0;

  for (i = 0; i < pointCount; ++i) {
    if (
      pt.segmentDistance(
        simplified[i],
        simplified[cycleIndex(i, pointCount, 1)],
      ) < 0.1
    ) {
      return false;
    }
  }

  return true;
}

function getArea(polygon: Point[]): number {
  const pointCount: number = polygon.length;
  let result: number = 0;
  let i: number = 0;
  let p1: Point = null;
  let p2: Point = null;

  for (i = 0; i < pointCount; ++i) {
    p1 = polygon[i];
    p2 = polygon[cycleIndex(i, pointCount, 1)];
    result += p1.x * p2.y - p2.x * p1.y;
  }
  return Math.abs(result) / 2;
}

function generateOffsets(): Point[] {
  const maxOffset: number = 1;
  const size: number = (2 * maxOffset + 1) ** 2;
  const result: Point[] = new Array(size - 1);
  let index: number = 0;
  let i: number = 0;
  let j: number = 0;

  for (i = -maxOffset; i <= maxOffset; ++i) {
    for (j = -maxOffset; j <= maxOffset; ++j) {
      if (i !== 0 || j !== 0) {
        result[index++] = new Point(i, j);
      }
    }
  }

  return result;
}

function checkPointValid(point: Point, contour: Point[]): boolean {
  return !getPointInside(point, contour) && getDistanceValid(point, contour);
}

export function optimizeSimplifiedPolygon(
  polygon: Point[],
  contour: Point[],
): Point[] {
  const optimizedPolygon: Point[] = polygon.map((point) => point.clone());
  const tempPolygon: Point[] = polygon.map((point) => point.clone());
  const pointCount: number = optimizedPolygon.length;
  const offsets: Point[] = generateOffsets();
  const indexCount: number = 3;
  const indices: Uint8Array = new Uint8Array(indexCount);
  let bestArea: number = getArea(optimizedPolygon);
  let currArea: number = 0;
  let isImproved = true;
  let currIndex: number = 0;
  let i: number = 0;
  let j: number = 0;

  if (
    !contour.every((pt) => getPointInside(pt, tempPolygon)) ||
    !contour.every((pt) => getDistanceValid(pt, tempPolygon))
  ) {
    return optimizedPolygon;
  }

  while (isImproved) {
    isImproved = false;

    for (i = 0; i < pointCount; ++i) {
      for (j = 0; j < indexCount; ++j) {
        indices[j] = cycleIndex(i, pointCount, j - 1);
      }

      tempPolygon.forEach((point, index) => point.set(optimizedPolygon[index]));

      for (const offset1 of offsets) {
        currIndex = indices[0];
        tempPolygon[currIndex].set(optimizedPolygon[currIndex]).add(offset1);

        if (!checkPointValid(tempPolygon[currIndex], contour)) {
          continue;
        }

        for (const offset2 of offsets) {
          currIndex = indices[1];
          tempPolygon[currIndex].set(optimizedPolygon[currIndex]).add(offset2);

          if (!checkPointValid(tempPolygon[currIndex], contour)) {
            continue;
          }

          for (const offset3 of offsets) {
            currIndex = indices[2];
            tempPolygon[currIndex]
              .set(optimizedPolygon[currIndex])
              .add(offset3);

            if (!checkPointValid(tempPolygon[currIndex], contour)) {
              continue;
            }

            currArea = getArea(tempPolygon);

            if (currArea >= bestArea) {
              continue;
            }

            if (
              contour.every((pt) => getPointInside(pt, tempPolygon)) &&
              contour.every((pt) => getDistanceValid(pt, tempPolygon))
            ) {
              bestArea = currArea;

              for (j = 0; j < indexCount; ++j) {
                currIndex = indices[j];
                optimizedPolygon[currIndex].set(tempPolygon[currIndex]);
              }

              isImproved = true;
            }
          }
        }
      }
    }
  }

  return optimizedPolygon;
}
