import { MAX_POINT_COUNT, MAX_SIMPLIFY_DISTANCE } from './constants';
import { getContourDirection, getPointIndex } from './utils';
import { cycleIndex } from '../utils';
import Point from './point';

function simplify(
  points: Point[],
  sqTolerance: number,
  simplified: Point[] = [points[0]],
  first: number = 0,
  last: number = points.length - 1,
  isRoot: boolean = true
): Point[] {
  let maxSqDist: number = sqTolerance;
  let index: number = 0;
  let i: number = 0;
  let sqDist: number = 0;

  for (i = first + 1; i < last; i++) {
    sqDist = Point.getSqSegDist(points[i], points[first], points[last]);

    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }

  if (maxSqDist > sqTolerance) {
    if (index - first > 1) {
      simplify(points, sqTolerance, simplified, first, index, false);
    }

    simplified.push(points[index]);

    if (last - index > 1) {
      simplify(points, sqTolerance, simplified, index, last, false);
    }
  }

  if (isRoot && points[last].clone().sub(points[first]).length >= 4) {
    simplified.push(points[last]);
  }

  return simplified;
}

function iterativeSimplify(initialPoints: Point[]): Point[] {
  let result: Point[] = initialPoints;
  let threshold: number = 2;
  let resultPointCount: number = initialPoints.length;
  let j: number = 0;
  let i: number = 0;
  let startIndex: number = 0;
  let endIndex: number = 0;
  let distance: number = 0;
  let currPoint: Point = initialPoints[0];
  let nextPoint: Point = initialPoints[0];

  while (true) {
    if (result.length <= 3) {
      return result;
    }

    result = simplify(result, threshold * threshold);
    threshold = threshold + 1;
    resultPointCount = result.length;
    distance = 0;

    for (i = 0; i < resultPointCount; ++i) {
      currPoint = result[i];
      nextPoint = result[cycleIndex(i, resultPointCount, 1)];
      startIndex = getPointIndex(initialPoints, currPoint) + 1;
      endIndex = getPointIndex(initialPoints, nextPoint);

      for (j = startIndex; j < endIndex; ++j) {
        distance = Math.max(
          initialPoints[j].distance(currPoint, nextPoint),
          distance
        );
      }

      if (
        resultPointCount <= MAX_POINT_COUNT &&
                distance > MAX_SIMPLIFY_DISTANCE
      ) {
        return result;
      }
    }
  }
}

function restore(result: Point[], initialPoints: Point[]): Point[] {
  const direction = getContourDirection(initialPoints);

  if (direction === -1) {
    initialPoints.reverse();
    result.reverse();
  }

  const contourSize: number = initialPoints.length;
  const line: Int32Array = new Int32Array(3);
  let i: number = 0;
  let j: number = 0;
  let isRestored: boolean = true;
  let pointCount: number = 0;
  let point1: Point = null;
  let point2: Point = null;
  let startIndex: number = 0;
  let endIndex: number = 0;
  let maxDistance: number = 0;
  let maxIndex: number = 0;
  let distance: number = 0;
  let value: number = 0;

  while (isRestored) {
    isRestored = false;

    pointCount = result.length;

    for (i = 0; i < pointCount - 1; ++i) {
      point1 = result[i];
      point2 = result[i + 1];
      startIndex = getPointIndex(initialPoints, point1);
      endIndex = getPointIndex(initialPoints, point2);
      endIndex =
                startIndex > endIndex ? endIndex + contourSize : endIndex;
      Point.getLineEquation(point1, point2, line);

      maxDistance = 0;

      for (j = startIndex + 1; j <= endIndex - 1; ++j) {
        point1 = initialPoints[j % contourSize];
        value = line[0] * point1.x + line[1] * point1.y + line[2];

        if (value > 0) {
          distance = point1.lineDistance(line);

          if (distance > maxDistance) {
            maxDistance = distance;
            maxIndex = j;
          }
        }
      }

      if (
        maxDistance > MAX_SIMPLIFY_DISTANCE &&
                result.length < MAX_POINT_COUNT
      ) {
        result.splice(i + 1, 0, initialPoints[maxIndex].clone());
        isRestored = true;
        break;
      }
    }
  }

  return result;
}

export default function simplifyPolygon(initialPoints: Point[]): Point[] {
  return initialPoints.length <= 4
    ? initialPoints.map((point) => point.clone())
    : restore(iterativeSimplify(initialPoints), initialPoints);
}
