import { cycleIndex } from '../utils';
import Point from './point';

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

function getPolygonValid(polygon: Point[], contour: Point[]): boolean {
  const pointCount: number = contour.length;
  let point: Point = contour[0];
  let i: number = 0;

  for (i = 0; i < pointCount; ++i) {
    point = contour[i];

    if (!point.getInside(polygon, false)) {
      return false;
    }
  }

  return true;
}

export function optimizeSimplifiedPolygon(
  polygon: Point[],
  contour: Point[]
): Point[] {
  const optimizedPolygon: Point[] = polygon.map((point) => point.clone());
  const tempPolygon: Point[] = polygon.map((point) => point.clone());
  const pointCount: number = optimizedPolygon.length;
  const offsets: Point[] = generateOffsets();
  const indexCount: number = 3;
  const indices: Uint8Array = new Uint8Array(indexCount);
  let bestArea: number = Math.abs(Point.getArea(optimizedPolygon));
  let currArea: number = 0;
  let isImproved = true;
  let currIndex: number = 0;
  let i: number = 0;
  let j: number = 0;

  if (!getPolygonValid(tempPolygon, contour)) {
    return optimizedPolygon;
  }

  while (isImproved) {
    isImproved = false;

    for (i = 0; i < pointCount; ++i) {
      for (j = 0; j < indexCount; ++j) {
        indices[j] = cycleIndex(i, pointCount, j - 1);
      }

      tempPolygon.forEach((point, index) =>
        point.set(optimizedPolygon[index])
      );

      for (const offset1 of offsets) {
        currIndex = indices[0];
        tempPolygon[currIndex]
          .set(optimizedPolygon[currIndex])
          .add(offset1);

        if (tempPolygon[currIndex].getInside(contour)) {
          continue;
        }

        for (const offset2 of offsets) {
          currIndex = indices[1];
          tempPolygon[currIndex]
            .set(optimizedPolygon[currIndex])
            .add(offset2);

          if (tempPolygon[currIndex].getInside(contour)) {
            continue;
          }

          for (const offset3 of offsets) {
            currIndex = indices[2];
            tempPolygon[currIndex]
              .set(optimizedPolygon[currIndex])
              .add(offset3);

            if (tempPolygon[currIndex].getInside(contour)) {
              continue;
            }

            currArea = Math.abs(Point.getArea(tempPolygon));

            if (
              currArea < bestArea &&
                            getPolygonValid(tempPolygon, contour)
            ) {
              bestArea = currArea;

              for (j = 0; j < indexCount; ++j) {
                currIndex = indices[j];
                optimizedPolygon[currIndex].set(
                  tempPolygon[currIndex]
                );
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
