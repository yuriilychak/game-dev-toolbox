import { MAX_POINT_COUNT, MAX_SIMPLIFY_DISTANCE } from "./constants";
import Point from "./point";
import { getContourDirection } from "./utils";
import Vector from "./vector";

function simplifyDPStep(
  points: Point[],
  first: number,
  last: number,
  sqTolerance: number,
  simplified: Point[],
): void {
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
      simplifyDPStep(points, first, index, sqTolerance, simplified);
    }
    simplified.push(points[index]);

    if (last - index > 1) {
      simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
  }
}

function simplifyDouglasPeucker(points: Point[], sqTolerance: number): Point[] {
  var last: number = points.length - 1;

  const simplified: Point[] = [points[0]];
  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);

  return simplified;
}

function findIndex(points: Point[], point: Point): number {
  let i: number = 0;
  const size: number = points.length;

  for (i = 0; i < size; ++i) {
    if (points[i].getEqual(point)) {
      return i;
    }
  }

  return size;
}

function removeCollinearPoints(points: Point[]): Point[] {
  const result: Point[] = [points[0]];
  let i: number = 0;
  let area: number = 0;
  let A: Point = null;
  let B: Point = null;
  let C: Point = null;

  for (i = 1; i < points.length - 1; ++i) {
    A = result[result.length - 1];
    B = points[i];
    C = points[i + 1];
    area = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);

    if (Math.abs(area) !== 0) {
      result.push(B);
    }
  }

  result.push(points[points.length - 1]);

  return result;
}

function simplify(inputPoints: Point[], tolerance: number = -1): Point[] {
  if (inputPoints.length <= 2) {
    return inputPoints;
  }

  const sqTolerance: number = tolerance > 0 ? tolerance * tolerance : 1;
  const colinearPoints = removeCollinearPoints(inputPoints);

  return simplifyDouglasPeucker(colinearPoints, sqTolerance);
}

function iterativeSimplify(initialPoints: Point[]): Point[] {
  let result: Point[] = initialPoints;
  let threshold: number = 2;
  let i: number = 0;
  let resultPointCount: number = initialPoints.length;
  let j: number = 0;
  const vector = new Vector();
  let startIndex: number = 0;
  let endIndex: number = 0;
  let distance: number = 0;

  while (true) {
    result = simplify(result, threshold);
    threshold = threshold + 1;
    resultPointCount = result.length;
    distance = 0;

    for (i = 0; i < resultPointCount; ++i) {
      vector.beginVertex = result[i];
      vector.endVertex = result[(i + 1) % resultPointCount];

      startIndex = findIndex(initialPoints, vector.beginVertex);
      endIndex = findIndex(initialPoints, vector.endVertex);

      for (j = startIndex + 1; j < endIndex; ++j) {
        distance = Math.max(vector.getDistance(initialPoints[j]), distance);
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

export default function simplifyPolygon(initialPoints: Point[]): Point[] {
  if (initialPoints.length <= 4) {
    return initialPoints.map((point) => point.clone());
  }

  const contourSize: number = initialPoints.length;
  const result: Point[] = iterativeSimplify(initialPoints);
  let line: Int32Array = new Int32Array(3);
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

  const direction = getContourDirection(initialPoints);

  if (direction === -1) {
    initialPoints.reverse();
    result.reverse();
  }

  while (isRestored) {
    isRestored = false;

    pointCount = result.length;

    for (i = 0; i < pointCount - 1; ++i) {
      point1 = result[i];
      point2 = result[i + 1];
      startIndex = initialPoints.findIndex((p) => p.getEqual(point1));
      endIndex = initialPoints.findIndex((p) => p.getEqual(point2));
      endIndex = startIndex > endIndex ? endIndex + contourSize : endIndex;
      Point.getLineEquation(point1, point2, line);

      maxDistance = 0;

      for (j = startIndex + 1; j <= endIndex - 1; ++j) {
        const point = initialPoints[j % contourSize];
        const value = line[0] * point.x + line[1] * point.y + line[2];

        if (value > 0) {
          distance = point.lineDistance(line);

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

  if (Point.getDistance(result[0], result[result.length - 1]) < 4) {
    result.pop();
  }

  return result;
}
