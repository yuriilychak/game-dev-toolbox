import earClipping from "./ear-clipping";
import Point from "./point";
import { generateTriangle, getCrossProduct } from "./utils";

function getConvex(inputPolygon: Array<Point>): boolean {
  let i: number = 0;
  const size: number = inputPolygon.length;

  for (i = 0; i < size; ++i) {
    if (
      getCrossProduct(
        inputPolygon[i],
        inputPolygon[(i + 1) % size],
        inputPolygon[(i + 2) % size],
      ) < 0
    ) {
      return false;
    }
  }

  return true;
}

function triangulateConvexPolygon(polygon: Array<Point>): Uint16Array {
  const size: number = polygon.length;

  if (size < 3) {
    return new Uint16Array(0);
  }

  let i: number = 0;

  const result = new Uint16Array(size - 2);

  for (i = 2; i < size; ++i) {
    result[i - 2] = generateTriangle(
      polygon,
      polygon[0],
      polygon[i - 1],
      polygon[i],
    );
  }

  return result;
}

export default function triangulate(inputPolygon: Array<Point>): Uint16Array {
  return getConvex(inputPolygon)
    ? triangulateConvexPolygon(inputPolygon)
    : earClipping(inputPolygon);
}
