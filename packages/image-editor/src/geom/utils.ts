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

export function getTriangleArea(p1: Point, p2: Point, p3: Point): number {
  return (
    0.5 *
    Math.abs(p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y))
  );
}

export function getQuadrilateralArea(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point,
): number {
  const area1 = getTriangleArea(p1, p2, p3);
  const area2 = getTriangleArea(p1, p3, p4);
  return area1 + area2;
}
