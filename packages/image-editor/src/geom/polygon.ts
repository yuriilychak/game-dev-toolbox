import ImageData from "../image-data";
import Point from "./point";
import marchSquare from "./marching-squares";
import extend from "./extend";
import simplifyPolygon from "./rdp";
import triangulate from "./triangulate";

export default class Polygon {
  private _polygon: Uint16Array;
  private _triangles: Uint16Array;
  private _bounds: Uint16Array;

  constructor(imageData: ImageData) {
    const contour = marchSquare(imageData, 0);
    console.log(contour);
    const simplifiedPolygon = simplifyPolygon(contour);
    const extendedPolygon = extend(simplifiedPolygon, contour, imageData);

    this._bounds = new Uint16Array(4);
    this._polygon = this.exportPoints(extendedPolygon, imageData);
    this._triangles = triangulate(extendedPolygon);
  }

  public export(): Uint16Array {
    const pointSize: number = this._polygon.length;
    const pointCount: number = pointSize >> 1;
    const triangleCount: number = this._triangles.length;

    const result: Uint16Array = new Uint16Array(pointSize + triangleCount + 5);

    result[0] = pointCount + (triangleCount << 5);
    result.set(this._bounds, 1);
    result.set(this._polygon, 5);
    result.set(this._triangles, pointSize + 5);

    return result;
  }

  private exportPoints(
    points: Array<Point>,
    imageData: ImageData,
  ): Uint16Array {
    const size = points.length;
    const result: Uint16Array = new Uint16Array(size << 1);

    let i: number = 0;
    let offset: number = 0;

    let minX: number = imageData.width;
    let maxX: number = 0;
    let minY: number = imageData.height;
    let maxY: number = 0;

    for (i = 0; i < size; ++i) {
      minX = Math.min(points[i].x, minX);
      maxX = Math.max(points[i].x, maxX);
      minY = Math.min(points[i].y, minY);
      maxY = Math.max(points[i].y, maxY);
    }

    this._bounds[0] = imageData.leftOffset - minX;
    this._bounds[1] = imageData.rightOffset - minY;
    this._bounds[2] = maxX - minX;
    this._bounds[3] = maxY - minY;

    for (i = 0; i < size; ++i) {
      offset = i << 1;
      result[offset] = points[i].x - minX;
      result[offset + 1] = points[i].y - minY;
    }

    return result;
  }
}
