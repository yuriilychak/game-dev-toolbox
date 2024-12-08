// @ts-expect-error no ts-defintion
import poly2tri from "poly2tri";

import BoundRect from "./bound-rect";
import extend from "./extend";
import Point from "./point";
import simplifyPolygon from "./simplify";
import { serializeTriangleIndices } from "../utils";
import { getPointIndex } from "./utils";
import { optimizeSimplifiedPolygon } from "./optimization";

export default class Polygon {
  private _contour: Point[];
  private _polygon: Point[];

  private _boundRect: BoundRect;

  constructor(contour: Point[]) {
    this._contour = contour;
    this._boundRect = BoundRect.fromPoints(contour);

    if (
      this._boundRect.width <= Polygon.QUAD_TRASHOLD ||
      this._boundRect.height <= Polygon.QUAD_TRASHOLD
    ) {
      this._boundRect.extend();
      this._polygon = this._boundRect.exportPolygon();
    } else {
      const simplifiedPolygon = simplifyPolygon(contour);

      this._polygon = extend(contour, simplifiedPolygon);

      this._boundRect = BoundRect.fromPoints(this._polygon);
    }
  }

  public optimize(): void {
    if (this.isRectangle) {
      return;
    }

    this._polygon = optimizeSimplifiedPolygon(this._polygon, this._contour);
    this._boundRect = BoundRect.fromPoints(this._polygon);
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

    let triangles: Uint16Array = null;

    const contour = this._polygon.map(
      (point) => new poly2tri.Point(point.x, point.y),
    );

    triangles = new Uint16Array(this.triangulate(contour));

    return [polygon, triangles];
  }

  private union(polygon: Polygon): void {
    this._boundRect = this._boundRect.union(polygon._boundRect);
    this._polygon = this._boundRect.exportPolygon();
  }

  private triangulate(convexPolygon: Point[]): number {
    const sweepContext = new poly2tri.SweepContext(convexPolygon);
    const triangulation = sweepContext.triangulate().getTriangles();

    return triangulation.map((triangle: { points_: Point[] }) => {
      const indices = triangle.points_.map((vertex: Point) =>
        getPointIndex(this._polygon, vertex),
      );

      return serializeTriangleIndices(indices[0], indices[1], indices[2]);
    });
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

  public get isConvex(): boolean {
    const pointCount: number = this._polygon.length;

    if (pointCount < 4) {
      return true;
    }

    let sign: number = 0;
    let currentSign: number = 0;
    let i: number = 0;

    for (i = 0; i < pointCount; ++i) {
      currentSign = Math.sign(
        Point.crossProduct(
          this._polygon[i],
          this._polygon[(i + 1) % pointCount],
          this._polygon[(i + 2) % pointCount],
        ),
      );

      if (currentSign === 0) {
        continue;
      }

      if (sign === -currentSign) {
        return false;
      }

      sign = currentSign;
    }

    return true;
  }

  public get polygon(): Point[] {
    return this._polygon;
  }

  public get isBroken(): boolean {
    return (
      this._polygon.length < 3 ||
      (this._boundRect.width < 3 && this._boundRect.height < 3)
    );
  }

  public get bounds(): BoundRect {
    return this._boundRect;
  }

  private static QUAD_TRASHOLD = 64;
}
