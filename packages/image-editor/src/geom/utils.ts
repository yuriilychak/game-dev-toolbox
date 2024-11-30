import Point from "./point";

export function findIndex(points: Point[], point: Point): number {
  let i: number = 0;
  const size: number = points.length;

  for (i = 0; i < size; ++i) {
    if (points[i].getEqual(point)) {
      return i;
    }
  }

  return size;
}

export function getLineEquation(point1: Point, point2: Point): Int32Array {
  const result = new Int32Array(3);
  result[0] = point2.y - point1.y;
  result[1] = point1.x - point2.x;
  result[2] = -(result[0] * point1.x + result[1] * point1.y);

  return result;
}

export function getContourDirection(contour: Point[]): number {
  const pointCount: number = contour.length;
  let area: number = 0;
  let i: number = 0;

  for (i = 0; i < pointCount; ++i) {
    const p1 = contour[i];
    const p2 = contour[(i + 1) % pointCount];

    area += p1.x * p2.y - p1.y * p2.x;
  }

  return Math.sign(area);
}
