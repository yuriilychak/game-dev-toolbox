import { intAbs, intSign } from "../math";
import Point from "./point";

export default class Vector {
  private _beginVertex: Point;
  private _endVertex: Point;

  constructor() {
    this._beginVertex = new Point();
    this._endVertex = new Point();
  }

  public getProjection(point: Point): Point {
    const lineEquation = this.lineEquation;
    const a = lineEquation[0];
    const b = lineEquation[1];
    const c = lineEquation[2];

    switch (true) {
      case a === 0:
        return new Point(point.x, this.beginVertex.y);
      case b === 0:
        return new Point(this.beginVertex.x, point.y);
      default: {
        const nb = point.y * a - point.x * b;
        const proportion = b * b + a * a;
        const projectionX = (-c * a - nb * b) / proportion;
        const projectionY = (nb * a - c * b) / proportion;

        return new Point(projectionX, projectionY);
      }
    }
  }

  public getIntersect(vector: Vector): Point | null {
    const currentEquation = this.lineEquation;
    const nextEquation = vector.lineEquation;

    const a1 = currentEquation[0];
    const b1 = currentEquation[1];
    const c1 = currentEquation[2];
    const a2 = nextEquation[0];
    const b2 = nextEquation[1];
    const c2 = nextEquation[2];

    const proportion = a1 * b2 - a2 * b1;

    return proportion === 0
      ? null
      : new Point(
          Math.round((b1 * c2 - b2 * c1) / proportion),
          Math.round((c1 * a2 - c2 * a1) / proportion),
        );
  }

  public getDistance(dot: Point): number {
    return (
      intAbs(
        this.offsetX * (this._beginVertex.y - dot.y) -
          this.offsetY * (this._beginVertex.x - dot.x),
      ) / this.module
    );
  }

  public getParalleleLineEquation(point: Point): Int16Array {
    const result: Int16Array = new Int16Array(3);

    result[0] = this._endVertex.x - this._beginVertex.x;
    result[1] = this._endVertex.y - this._beginVertex.y;
    result[2] = point.x * result[1] - point.y * result[0];

    return result;
  }

  get lineEquation(): Int16Array {
    const result = new Int16Array(3);

    result[0] = this.offsetY;
    result[1] = -this.offsetX;
    result[2] =
      -this._beginVertex.y * result[1] - result[0] * this._beginVertex.x;

    return result;
  }

  public getCrossProduct(point: Point): number {
    const v1 = Point.sub(this._beginVertex, this._endVertex);
    const v2 = Point.sub(this._beginVertex, point);

    return v1.x * v2.y - v1.y * v2.x;
  }

  get offsetX(): number {
    return this._endVertex.x - this._beginVertex.x;
  }

  get offsetY(): number {
    return this._endVertex.y - this._beginVertex.y;
  }

  get direction(): Point {
    return new Point(this.offsetX, this.offsetY);
  }

  get directionIndex(): number {
    const offsetX = Math.sign(this.offsetX);
    const offsetY = Math.sign(this.offsetY);

    return (offsetY + 1) * 3 + offsetX + 1;
  }

  get beginVertex(): Point {
    return this._beginVertex;
  }

  get endVertex(): Point {
    return this._endVertex;
  }

  set beginVertex(value: Point) {
    this._beginVertex.set(value);
  }

  set endVertex(value: Point) {
    this._endVertex.set(value);
  }

  get lineVertices(): Array<Point> {
    const result = new Array<Point>();
    const offsetX = this.offsetX;
    const offsetY = this.offsetY;
    let x0: number = this._beginVertex.x;
    let y0: number = this._beginVertex.y;
    let dx: number = intAbs(offsetX);
    let dy: number = intAbs(offsetY);
    const signX = intSign(offsetX);
    const signY = intSign(offsetY);
    const sx = signX * signX + signX - 1;
    const sy = signY * signY + signY - 1;
    let err = dx - dy;

    while (true) {
      result.push(new Point(x0, y0));

      if (x0 == this._endVertex.x && y0 == this._endVertex.y) {
        return result;
      }

      let e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  }

  get module(): number {
    const diff = Point.sub(this._endVertex, this._beginVertex);

    return Math.sqrt(diff.x * diff.x + diff.y * diff.y);
  }
}
