import Point from "./point";
import simplifyPolygon from "./rdp";
import { getLineEquation } from "./utils";

function findIntersection(line1: Int32Array, line2: Int32Array): Point | null {
  const [a1, b1, c1] = line1;
  const [a2, b2, c2] = line2;

  const denominator = a1 * b2 - a2 * b1;

  // Перевіряємо, чи лінії не паралельні (детермінант != 0)
  if (denominator === 0) {
    return null; // Лінії паралельні, перетину немає
  }

  // Знаходимо точку перетину
  const x = -(b2 * c1 - b1 * c2) / denominator;
  const y = -(a1 * c2 - a2 * c1) / denominator;

  return new Point(x, y);
}

function findIntersections(lines: Int32Array[]): Point[] {
  const intersections: Point[] = [];

  for (let i = 0; i < lines.length; i++) {
    const intersection = findIntersection(
      lines[i],
      lines[(i + 1) % lines.length],
    );

    if (intersection) {
      intersections.push(intersection);
    }
  }

  return intersections;
}

export default function extend(
  originalContour: Point[],
  simplifiedContour: Point[],
): Point[] {
  const lines: Int32Array[] = [];
  const contourSize: number = originalContour.length;
  const polygonSize: number = simplifiedContour.length;
  let line: Int32Array = null;
  let point1: Point = null;
  let point2: Point = null;
  let startIndex: number = 0;
  let endIndex: number = 0;
  let isLineInvalid: boolean = false;
  let i: number = 0;
  let j: number = 0;

  for (i = 0; i < polygonSize; ++i) {
    point1 = simplifiedContour[i];
    point2 = simplifiedContour[(i + 1) % polygonSize];
    startIndex = originalContour.findIndex((p) => p.getEqual(point1));
    endIndex = originalContour.findIndex((p) => p.getEqual(point2));
    endIndex = startIndex > endIndex ? endIndex + contourSize : endIndex;
    line = getLineEquation(point2, point1);

    isLineInvalid = true;

    while (isLineInvalid) {
      isLineInvalid = false;

      for (j = startIndex; j <= endIndex; ++j) {
        const point = originalContour[j % contourSize];
        const value = line[0] * point.x + line[1] * point.y + line[2];

        if (value <= 0 || point.lineDistance(line) < 1) {
          line[2] += 1;
          isLineInvalid = true;
          break;
        }
      }
    }

    lines.push(line);
  }

  return findIntersections(lines);
}
