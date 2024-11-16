import Point from "./point";
import Vector from "./vector";

function simplifyRadialDist(
  points: Array<Point>,
  sqTolerance: number,
): Array<Point> {
  let i: number = 0;

  const pointCount: number = points.length;
  const result: Array<Point> = [points[0]];
  let prevPoint: Point = points[0];
  let currentPoint: Point = points[0];

  for (i = 1; i < pointCount; ++i) {
    currentPoint = points[i];

    if (Point.getSqDist(currentPoint, prevPoint) <= sqTolerance) {
      continue;
    }

    result.push(new Point(currentPoint.x, currentPoint.y));
    prevPoint = currentPoint;
  }

  if (!prevPoint.getEqual(currentPoint)) {
    result.push(new Point(currentPoint.x, currentPoint.y));
  }

  return result;
}

function simplifyDPStep(
  points: Array<Point>,
  first: number,
  last: number,
  sqTolerance: number,
  simplified: Array<Point>,
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
    if (index - first > 1)
      simplifyDPStep(points, first, index, sqTolerance, simplified);
    simplified.push(points[index]);
    if (last - index > 1)
      simplifyDPStep(points, index, last, sqTolerance, simplified);
  }
}

function simplifyDouglasPeucker(
  points: Array<Point>,
  sqTolerance: number,
): Array<Point> {
  var last: number = points.length - 1;

  const simplified: Array<Point> = [points[0]];
  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);

  return simplified;
}

function findIndex(points: Array<Point>, point: Point): number {
  let i: number = 0;
  const size: number = points.length;

  for (i = 0; i < size; ++i) {
    if (points[i].getEqual(point)) {
      return i;
    }
  }

  return size;
}

function simplify(
  inputPoints: Array<Point>,
  tolerance: number = -1,
  highestQuality: boolean = false,
): Array<Point> {
  if (inputPoints.length <= 2) {
    return inputPoints;
  }

  const sqTolerance: number = tolerance > 0 ? tolerance * tolerance : 1;

  const points = highestQuality
    ? inputPoints
    : simplifyRadialDist(inputPoints, sqTolerance);

  return simplifyDouglasPeucker(points, sqTolerance);
}

export default function simplifyPolygon(
  initialPoints: Array<Point>,
): Array<Point> {
  let result: Array<Point> = initialPoints;
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
    threshold = threshold << 1;
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

      if (resultPointCount <= 32 && distance > 8) {
        return result;
      }
    }
  }
}
