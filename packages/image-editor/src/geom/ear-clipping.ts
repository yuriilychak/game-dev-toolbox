import Point from "./point";
import { generateTriangle, getCrossProduct } from "./utils";

function isEar(
  polygon: Array<Point>,
  i: number,
  j: number,
  k: number,
): boolean {
  const a: Point = polygon[i];
  const b: Point = polygon[j];
  const c: Point = polygon[k];

  if (getCrossProduct(a, c, b) <= 0) {
    return false;
  }

  let m: number = 0;
  const size: number = polygon.length;

  for (m = 0; m < size; ++m) {
    if (
      m !== i &&
      m !== j &&
      m !== k &&
      isPointInsideTriangle(polygon[m], a, b, c)
    ) {
      return false;
    }
  }

  return true;
}

function isPointInsideTriangle(
  point: Point,
  a: Point,
  b: Point,
  c: Point,
): boolean {
  const crossProduct1 = getCrossProduct(a, point, b);
  const crossProduct2 = getCrossProduct(b, point, c);
  const crossProduct3 = getCrossProduct(c, point, a);

  return (
    (crossProduct1 >= 0 && crossProduct2 >= 0 && crossProduct3 >= 0) ||
    (crossProduct1 <= 0 && crossProduct2 <= 0 && crossProduct3 <= 0)
  );
}

export default function earClipping(inputPolygon: Array<Point>): Uint16Array {
  const polygon: Point[] = inputPolygon.slice().reverse();
  const triangles: number[] = [];
  let i: number = 0;
  let earFound: boolean = false;
  let size: number = polygon.length;
  let prevIndex: number = 0;
  let nextIndex: number = 0;

  while (size >= 3) {
    earFound = false;

    for (i = 0; i < size; ++i) {
      prevIndex = (i - 1 + size) % size;
      nextIndex = (i + 1) % size;

      if (isEar(polygon, prevIndex, i, nextIndex)) {
        triangles.push(
          generateTriangle(
            inputPolygon,
            polygon[prevIndex],
            polygon[i],
            polygon[nextIndex],
          ),
        );

        polygon.splice(i, 1);
        --size;

        earFound = true;
        break;
      }
    }

    if (!earFound) {
      break;
    }
  }

  const result = new Uint16Array(triangles.length);

  result.set(triangles);

  return result;
}
