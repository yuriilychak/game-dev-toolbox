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

export function getCrossProduct(start: Point, mid: Point, end: Point): number {
  const v1 = Point.sub(start, end);
  const v2 = Point.sub(start, mid);

  return v1.x * v2.y - v1.y * v2.x;
}

export function generateTriangle(
  points: Array<Point>,
  a: Point,
  b: Point,
  c: Point,
): number {
  return (
    (findIndex(points, c) << 10) +
    (findIndex(points, b) << 5) +
    findIndex(points, a)
  );
}
