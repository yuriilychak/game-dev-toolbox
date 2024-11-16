import ImageData from "../image-data";
import Point from "./point";
import marchSquare from "./marching-squares";
import extend from "./extend";
import simplifyPolygon from "./rdp";
import triangulate from "./triangulate";

function exportPoints(points: Array<Point>): Uint16Array {
  const size = points.length;
  const result: Uint16Array = new Uint16Array(size << 1);

  let i: number = 0;
  let offset: number = 0;

  for (i = 0; i < size; ++i) {
    offset = i << 1;
    result[offset] = points[i].x;
    result[offset + 1] = points[i].y;
  }

  return result;
}

export default class Polygon {
  private _polygon: Uint16Array;
  private _triangles: Uint16Array;

  constructor(imageData: ImageData) {
    const contour = marchSquare(imageData, 0);
    const simplifiedPolygon = simplifyPolygon(contour);
    const extendedPolygon = extend(simplifiedPolygon, contour, imageData);

    this._polygon = exportPoints(extendedPolygon);
    this._triangles = triangulate(extendedPolygon);
  }

  public export(): Uint16Array {
    const pointSize: number = this._polygon.length;
    const pointCount: number = pointSize >> 1;
    const triangleCount: number = this._triangles.length;

    const result: Uint16Array = new Uint16Array(pointSize + triangleCount + 1);

    result[0] = pointCount + (triangleCount << 5);
    result.set(this._polygon, 1);
    result.set(this._triangles, pointSize + 1);

    return result;
  }
}
