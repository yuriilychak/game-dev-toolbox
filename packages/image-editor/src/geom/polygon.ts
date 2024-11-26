// @ts-expect-error
import poly2tri from "poly2tri";

import ImageData from "../image-data";
import BoundRect from "./bound-rect";
import extend from "./extend";
import Point from "./point";
import simplifyPolygon from "./rdp";
import { serializeTriangleIndices } from "../utils";

export default class Polygon {
  private _polygon: Point[];

  private _boundRect: BoundRect;

  constructor(contour: Point[], imageData: ImageData) {
    this._boundRect = new BoundRect();
    this._boundRect.fromPoints(contour);

    if (
      this._boundRect.width <= Polygon.QUAD_TRASHOLD ||
      this._boundRect.height <= Polygon.QUAD_TRASHOLD
    ) {
      this._polygon = this._boundRect.exportPolygon();
    } else {
      const simplifiedPolygon = simplifyPolygon(contour);
      this._polygon = extend(simplifiedPolygon, contour, imageData);
      this._boundRect.fromPoints(this._polygon);
    }
  }

  public unite(polygons: Polygon[], index: number): number {
    const polygonCount: number = polygons.length;

    if (polygonCount === 1 || !this.isRectangle) {
      return -1;
    }

    let polygon: Polygon = null;
    let i: number = 0;

    for (i = 0; i < polygonCount; ++i) {
      polygon = polygons[i];

      if (
        index !== i &&
        polygon.isRectangle &&
        this.bounds.unionSqaureDiff(polygon.bounds) < 1024
      ) {
        this.union(polygon);

        return i;
      }
    }

    return -1;
  }

  public export(offsetX: number, offsetY: number): Uint16Array[] {
    const pointCount: number = this._polygon.length;
    let i: number = 0;
    let indexOffset: number = 0;

    const polygon: Uint16Array = new Uint16Array(pointCount << 1);

    for (i = 0; i < pointCount; ++i) {
      indexOffset = i << 1;
      polygon[indexOffset] = this._polygon[i].x - offsetX;
      polygon[indexOffset + 1] = this._polygon[i].y - offsetY;
    }

    const contour = this._polygon.map(
      (point) => new poly2tri.Point(point.x, point.y),
    );
    const sweepContext = new poly2tri.SweepContext(contour);

    const triangles = new Uint16Array(
      sweepContext
        .triangulate()
        .getTriangles()
        .map((triangle: { points_: Point[] }) => {
          const indices = triangle.points_.map((vertex: Point) =>
            this._polygon.findIndex((point) => point.getEqual(vertex)),
          );

          return serializeTriangleIndices(indices[0], indices[1], indices[2]);
        }),
    );

    return [polygon, triangles];
  }

  private union(polygon: Polygon): void {
    this._boundRect = this._boundRect.union(polygon._boundRect);
    this._polygon = this._boundRect.exportPolygon();
  }

  public get isRectangle(): boolean {
    return (
      this._polygon.length === 4 &&
      ((this._polygon[0].x === this._polygon[1].x &&
        this._polygon[2].x === this._polygon[3].x &&
        this._polygon[0].y === this._polygon[3].y &&
        this._polygon[1].y === this._polygon[2].y) ||
        (this._polygon[0].y === this._polygon[1].y &&
          this._polygon[2].y === this._polygon[3].y &&
          this._polygon[0].x === this._polygon[3].x &&
          this._polygon[1].x === this._polygon[2].x))
    );
  }

  public get isBroken(): boolean {
    return this._boundRect.width < 3 && this._boundRect.height < 3;
  }

  public get bounds(): BoundRect {
    return this._boundRect;
  }

  private static QUAD_TRASHOLD = 64;
}
