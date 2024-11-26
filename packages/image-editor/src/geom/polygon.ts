//@ts-expect-error
import poly2tri from "poly2tri";

import ImageData from "../image-data";
import Point from "./point";
import marchSquare from "./marching-squares";
import extend from "./extend";
import simplifyPolygon from "./rdp";
import {
  differenceBetweenBoundingBoxAndArea,
  getBoundingBox,
  getQuadPolygonFromRect,
  isRectangle,
  serializeTriangleIndices,
} from "../utils";
import { getCountourBounds } from "./utils";
import { QUAD_TRIANGLES } from "../constants";

export default class Polygon {
  private _polygons: Uint16Array[];
  private _triangles: Uint16Array[];
  private _bounds: Uint16Array[];
  private _imageData: ImageData;

  constructor(imageData: ImageData) {
    this._polygons = [];
    this._triangles = [];
    this._bounds = [];
    let contour: Point[] = [];
    let simplifiedPolygon: Point[] = [];
    let extendedPolygon: Point[] = [];
    let bound: Uint16Array;

    while (!imageData.isEmpty) {
      contour = marchSquare(imageData, 0);
      bound = getCountourBounds(contour);

      if (bound[2] <= 64 || bound[3] <= 64) {
        this._polygons.push(getQuadPolygonFromRect(bound));
        this._bounds.push(bound);
        this._triangles.push(QUAD_TRIANGLES.slice());
      } else {
        simplifiedPolygon = simplifyPolygon(contour);
        extendedPolygon = extend(simplifiedPolygon, contour, imageData);

        const contourP = extendedPolygon.map(
          (point) => new poly2tri.Point(point.x, point.y),
        );
        const swctx = new poly2tri.SweepContext(contourP);

        this._triangles.push(
          new Uint16Array(
            swctx
              .triangulate()
              .getTriangles()
              .map((triangle: { points_: Point[] }) => {
                const indices = triangle.points_.map((vertex: Point) =>
                  extendedPolygon.findIndex((point) => point.getEqual(vertex)),
                );

                return serializeTriangleIndices(
                  indices[0],
                  indices[1],
                  indices[2],
                );
              }),
          ),
        );

        bound = getCountourBounds(extendedPolygon);

        this._polygons.push(this.exportPoints(extendedPolygon));
        this._bounds.push(bound);
      }

      imageData.clearContour(contour);

      this._imageData = imageData;
    }

    let isUnited = true;
    let i: number = 0;
    let j: number = 0;
    let polygon1: Uint16Array;
    let polygon2: Uint16Array;

    while (isUnited) {
      isUnited = false;

      for (i = 0; i < this._polygons.length; ++i) {
        polygon1 = this._polygons[i];

        if (!isRectangle(polygon1)) {
          continue;
        }

        for (j = 0; j < this._polygons.length; ++j) {
          polygon2 = this._polygons[j];

          if (i === j || !isRectangle(polygon2)) {
            continue;
          }

          if (differenceBetweenBoundingBoxAndArea(polygon1, polygon2) < 1024) {
            isUnited = true;
            this._bounds[i] = getBoundingBox(polygon1, polygon2);
            this._polygons[i] = getQuadPolygonFromRect(this._bounds[i]);
            this._polygons.splice(j, 1);
            this._triangles.splice(j, 1);
            this._bounds.splice(j, 1);
            break;
          }
        }

        if (isUnited) {
          break;
        }
      }
    }
  }

  public export(): {
    polygons: Uint16Array[];
    triangles: Uint16Array[];
    bounds: Uint16Array[];
    resultBounds: Uint16Array;
  } {
    const resultBounds = this._bounds.reduce(
      (result, bound) => {
        result[0] = Math.min(result[0], bound[0]);
        result[1] = Math.min(result[1], bound[1]);
        result[2] = Math.max(result[2], bound[0] + bound[2]);
        result[3] = Math.max(result[3], bound[1] + bound[3]);

        return result;
      },
      new Uint16Array([2048, 2048, 0, 0]),
    );

    const minX = resultBounds[0];
    const minY = resultBounds[1];
    resultBounds[2] = resultBounds[2] - resultBounds[0];
    resultBounds[3] = resultBounds[3] - resultBounds[1];
    resultBounds[0] = this._imageData.leftOffset - resultBounds[0];
    resultBounds[1] = this._imageData.topOffset - resultBounds[1];

    this._polygons.forEach((polygon) => {
      let i: number = 0;
      let offset: number = 0;
      const size: number = polygon.length >> 1;

      for (i = 0; i < size; ++i) {
        offset = i << 1;
        polygon[offset] = polygon[offset] - minX;
        polygon[offset + 1] = polygon[offset + 1] - minY;
      }
    });

    return {
      polygons: this._polygons,
      triangles: this._triangles,
      bounds: this._bounds,
      resultBounds,
    };
  }

  private exportPoints(points: Array<Point>): Uint16Array {
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
}
